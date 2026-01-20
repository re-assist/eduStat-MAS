document.addEventListener('DOMContentLoaded', () => {

    // Part 1: Security & Trap
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("Logged in:", user.email);
            const emailDisplay = document.getElementById('user-email-display');
            if (emailDisplay) { emailDisplay.innerText = user.email; }

            // THE TRAP
            history.pushState(null, null, location.href);

            window.onpopstate = function () {
                const userWantsToLeave = confirm("Going back will log you out. Are you sure?");
                if (userWantsToLeave) {
                    auth.signOut().then(() => {
                        // REPLACE history to prevent forward navigation
                        window.location.replace('./login.html'); 
                    });
                } else {
                    history.pushState(null, null, location.href);
                }
            };

            // Force Reload on "Forward" 
            window.addEventListener( "pageshow", function ( event ) {
                if ( event.persisted ) {
                    window.location.reload();
                }
            });

           
            loadAndGroupData(); 

        } else {
            window.location.replace('./login.html');
        }
    });

    // Logout Button
    document.getElementById('logout-button').addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.replace('./login.html');
        });
    });

    // Profile Dropdown
    document.querySelector('.profile-icon').addEventListener('click', () => {
        document.querySelector('.dropdown-content').classList.toggle('show');
    });

    //  Part 2: Global Data Storage 
    let allStudents = []; 
    let uniqueCourses = [];
    
    //  Part 3: Color Generator 
    function getCourseColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360; 
        return `hsl(${h}, 70%, 90%)`; 
    }

    //  Part 4: Fetch & Group Data 
    const coursesContainer = document.getElementById('courses-container');
    const deptFilter = document.getElementById('dept-filter');
    const subjectFilter = document.getElementById('subject-filter');
    const searchBar = document.getElementById('search-bar');

    function loadAndGroupData() {
        db.collection("students").orderBy("roll_number").get().then(snapshot => {
            coursesContainer.innerHTML = '';
            
            if (snapshot.empty) {
                coursesContainer.innerHTML = '<div style="padding:20px; text-align:center">No students found.</div>';
                return;
            }

            // 1. Store all data in memory
            allStudents = [];
            uniqueCourses = [];
            
            snapshot.forEach(doc => {
                const s = doc.data();
                s.docId = doc.id; // Save ID for updates
                allStudents.push(s);
                
                if (!uniqueCourses.includes(s.course)) {
                    uniqueCourses.push(s.course);
                }
            });

            // 2. Populate Dept Filter
            populateDeptFilter();

            // 3. Render Initial View (All Courses)
            renderCourses(allStudents);

        }).catch(err => console.error("Error loading data:", err));
    }

    //  Part 5: Rendering Logic 
    function renderCourses(studentsToRender) {
        coursesContainer.innerHTML = '';

        // Group students by Course
        const grouped = {};
        studentsToRender.forEach(student => {
            if (!grouped[student.course]) grouped[student.course] = [];
            grouped[student.course].push(student);
        });

        // Loop through each course group and create a Box
        Object.keys(grouped).forEach(courseName => {
            const studentsInCourse = grouped[courseName];
            const courseColor = getCourseColor(courseName);

            // Create Section
            const section = document.createElement('div');
            section.className = 'course-section';
            
            // Header
            section.innerHTML = `
                <div class="course-header" style="background-color: ${courseColor}; border-left: 5px solid ${courseColor.replace('90%', '70%')}">
                    <h3>${courseName}</h3>
                    <span class="course-count">${studentsInCourse.length} Students</span>
                </div>
            `;

            // Table Container
            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'grades-container'; 
            tableWrapper.style.boxShadow = 'none'; 
            tableWrapper.style.borderRadius = '0';

            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Max</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="tbody-${courseName}"></tbody>
            `;
            
            const tbody = table.querySelector('tbody');

            // Fill Rows
            studentsInCourse.forEach(student => {
                if (student.grades && Array.isArray(student.grades)) {
                    student.grades.forEach(grade => {
                        // Apply Subject Filter Logic here
                        const selectedSubject = subjectFilter.value;
                        if (selectedSubject !== 'all' && grade.subject_name !== selectedSubject) {
                            return; // Skip this row
                        }

                        const tr = document.createElement('tr');
                        const currentMarks = grade.marks !== null ? grade.marks : "";
                        
                        tr.innerHTML = `
                            <td>${student.roll_number}</td>
                            <td>${student.name}</td>
                            <td>${grade.subject_name}</td>
                            <td><input type="number" class="marks-input" value="${currentMarks}" min="0" max="${grade.max_marks}"></td>
                            <td>${grade.max_marks}</td>
                            <td>
                                <button class="save-btn" 
                                    data-doc-id="${student.docId}" 
                                    data-subject-name="${grade.subject_name}">
                                    Save
                                </button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            });

            // Only append the box if there are visible rows
            if (tbody.children.length > 0) {
                tableWrapper.appendChild(table);
                section.appendChild(tableWrapper);
                coursesContainer.appendChild(section);
            }
        });
    }

    //  Part 6: Filter Logic 
    function populateDeptFilter() {
        deptFilter.innerHTML = '<option value="all">All Departments</option>';
        uniqueCourses.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.innerText = c;
            deptFilter.appendChild(opt);
        });
    }

    // Event: Department Changed
    deptFilter.addEventListener('change', () => {
        const selectedDept = deptFilter.value;
        
        // Update Subject Filter options
        subjectFilter.innerHTML = '<option value="all">All Subjects</option>';
        
        if (selectedDept === 'all') {
            subjectFilter.disabled = true;
        } else {
            subjectFilter.disabled = false;
            const subjects = new Set();
            allStudents.filter(s => s.course === selectedDept).forEach(s => {
                if(s.grades) s.grades.forEach(g => subjects.add(g.subject_name));
            });
            
            subjects.forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub;
                opt.innerText = sub;
                subjectFilter.appendChild(opt);
            });
        }

        applyAllFilters();
    });

    // Event: Subject Changed
    subjectFilter.addEventListener('change', applyAllFilters);

    // Event: Text Search
    searchBar.addEventListener('keyup', applyAllFilters);

    function applyAllFilters() {
        const dept = deptFilter.value;
        const txt = searchBar.value.toLowerCase();

        // Filter 1: By Department
        let filtered = allStudents;
        if (dept !== 'all') {
            filtered = allStudents.filter(s => s.course === dept);
        }

        // Filter 2: By Text Search (Name/Roll)
        if (txt) {
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(txt) || 
                s.roll_number.toLowerCase().includes(txt)
            );
        }
        
        renderCourses(filtered);
    }

    //  Part 7: Save Function 
    coursesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-btn')) {
            const btn = e.target;
            const input = btn.closest('tr').querySelector('.marks-input');
            const newMark = parseInt(input.value);

            if (isNaN(newMark)) return alert("Invalid Mark");

            btn.innerText = "Saving...";
            const studentRef = db.collection("students").doc(btn.dataset.docId);
            
            studentRef.get().then(doc => {
                const s = doc.data();
                const idx = s.grades.findIndex(g => g.subject_name === btn.dataset.subjectName);
                if (idx > -1) s.grades[idx].marks = newMark;
                
                studentRef.update({ grades: s.grades }).then(() => {
                    btn.innerText = "Saved!";
                    setTimeout(() => btn.innerText = "Save", 2000);
                });
            });
        }
    });

    // Close dropdown logic
    window.onclick = function(event) {
        if (!event.target.matches('.profile-icon')) {
            document.querySelector('.dropdown-content').classList.remove('show');
        }
    }
});