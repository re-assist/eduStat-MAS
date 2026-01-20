document.addEventListener('DOMContentLoaded', () => {
    
    const searchBtn = document.getElementById('student-search-btn');
    const searchInput = document.getElementById('student-search-input');
    const errorMsg = document.getElementById('search-error-msg');
    const resultContainer = document.getElementById('result-container');
    
    // Result elements
    const displayName = document.getElementById('display-name');
    const displayCourse = document.getElementById('display-course');
    const displayRoll = document.getElementById('display-roll');
    const tableBody = document.getElementById('result-table-body');
    const summaryRoll = document.getElementById('summary-roll');
    const summaryGpa = document.getElementById('summary-gpa');
    const summaryClass = document.getElementById('summary-class');

    searchBtn.addEventListener('click', handleSearch);

    function handleSearch() {
        const rollNumber = searchInput.value.trim();
        
        // Reset UI
        errorMsg.innerText = "";
        resultContainer.style.display = 'none';
        tableBody.innerHTML = "";

        if(!rollNumber) {
            errorMsg.innerText = "Please enter a roll number.";
            return;
        }

        // Search Firestore for the roll number
        db.collection('students').where('roll_number', '==', rollNumber).get()
        .then(snapshot => {
            if (snapshot.empty) {
                errorMsg.innerText = "Roll number doesn't exist in the institution's database.";
                return;
            }

            // We assume roll numbers are unique, so we take the first match
            const doc = snapshot.docs[0];
            const student = doc.data();

            processResult(student);
        })
        .catch(error => {
            console.error("Error:", error);
            errorMsg.innerText = "An error occurred while searching.";
        });
    }

    function processResult(student) {
        const grades = student.grades;

        // 1. Check if grades exist
        if (!grades || !Array.isArray(grades) || grades.length === 0) {
            errorMsg.innerText = "Result not yet released, please contact respective course faculty for further information.";
            return;
        }

        // 2. Check for incomplete marks (null, empty, or undefined)
        const hasIncompleteMarks = grades.some(g => g.marks === null || g.marks === "" || g.marks === undefined);
        if (hasIncompleteMarks) {
            errorMsg.innerText = "Result not yet released, please contact respective course faculty for further information.";
            return;
        }

 
        let totalMarksAcquired = 0;
        let totalMaxMarks = 0;
        let isFailed = false; // Track if student failed any subject

        // Clear previous rows
        tableBody.innerHTML = "";

        grades.forEach(subject => {
            const marks = parseInt(subject.marks);
            const max = parseInt(subject.max_marks);
            
            // Calculation: Grade Points (0-10, rounded)
            let gradePoints = Math.round((marks / max) * 10);
            
            // Determine Grade Letter
            let gradeLetter = "";
            
            // Special Rule: 4 or below is Fail (F)
            // Logic: If points are <= 4, it is F.
            if (gradePoints <= 4) {
                gradeLetter = "F";
                gradePoints = 0; // Grade point turns 0 on fail
                isFailed = true;
            } else {
                switch(gradePoints) {
                    case 10: gradeLetter = "S"; break;
                    case 9:  gradeLetter = "A"; break;
                    case 8:  gradeLetter = "B"; break;
                    case 7:  gradeLetter = "C"; break;
                    case 6:  gradeLetter = "D"; break;
                    case 5:  gradeLetter = "E"; break;
                    default: gradeLetter = "F"; isFailed = true; break; 
                }
            }

            // Add to totals for GPA calculation
            totalMarksAcquired += marks;
            totalMaxMarks += max;

            // Create Table Row
            const row = `
                <tr>
                    <td style="text-align: left;">${subject.subject_name}</td>
                    <td>${max}</td>
                    <td>${marks}</td>
                    <td>${gradePoints}</td>
                    <td style="font-weight:bold; ${gradeLetter === 'F' ? 'color:red;' : ''}">${gradeLetter}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        // 3. Calculate GPA
        // Formula: (Total Acquired / Total Max) * 10
        let rawGpa = (totalMarksAcquired / totalMaxMarks) * 10;
        
        // Format: 2 decimal places, strip trailing zeros (8.50 -> 8.5)
        let finalGpa = parseFloat(rawGpa.toFixed(2));

        // 4. Determine Result Class
        let resultClass = "";
        
        if (isFailed) {
            resultClass = "FAIL";
        } else if (finalGpa >= 8.00) {
            resultClass = "DISTINCTION";
        } else if (finalGpa >= 6.00) {
            resultClass = "MERIT";
        } else if (finalGpa >= 4.01) {
            resultClass = "PASS";
        } else {
            resultClass = "FAIL";
        }

        // Update HTML Elements
        displayName.innerText = student.name;
        displayCourse.innerText = student.course;
        displayRoll.innerText = student.roll_number;
        
        summaryRoll.innerText = student.roll_number;
        summaryGpa.innerText = finalGpa;
        summaryClass.innerText = resultClass;
        
        // Color code the result class
        if(resultClass === "FAIL") summaryClass.style.color = "red";
        else summaryClass.style.color = "green";

        // Show the result container
        resultContainer.style.display = 'block';
    }
}); 