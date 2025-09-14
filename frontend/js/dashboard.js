document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  const welcomeHeader = document.getElementById("welcomeHeader");
  const sidebar = document.querySelector(".sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const dashboardContainer = document.querySelector(".dashboard-container");
  const sidebarLinks = document.querySelectorAll(".sidebar-nav a");
  const taskSections = document.querySelectorAll(".task-section");
  const userMenuToggle = document.getElementById("userMenuToggle");
  const userMenuDropdown = document.getElementById("userMenuDropdown");
  const userAvatar = document.getElementById("userAvatar");
  const userNameSpan = document.querySelector(".user-name");
  const addTaskForm = document.getElementById("addTaskForm");
  const currentTasksContainer = document.getElementById("currentTaskList");
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function showAlert(message, type = 'info') {
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');

    if (customAlert && alertMessage) {
        alertMessage.textContent = message;
        customAlert.className = 'custom-alert'; // Reset classes
        customAlert.classList.add(type);
        customAlert.style.display = 'block';

        setTimeout(() => {
            customAlert.style.display = 'none';
        }, 3000);
    }
  }

  // Hamburger Menu Logic
  function toggleMobileMenu() {
      mobileNav.classList.toggle('open');
      overlay.classList.toggle('active');
  }

  if(hamburgerMenu && sidebar && overlay){
    hamburgerMenu.addEventListener('click', toggleMobileMenu);
    overlay.addEventListener('click', toggleMobileMenu);
    mobileNavLinks.forEach(link => { // Changed from sidebarLinks to mobileNavLinks
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('open')) { // Changed from sidebar to mobileNav
                toggleMobileMenu();
            }
        });
    });
  }

  // Mobile Profile Dropdown Logic
  const mobileUserMenuToggle = document.getElementById('mobileUserMenuToggle');
  const mobileUserMenuDropdown = document.getElementById('mobileUserMenuDropdown');

  if (mobileUserMenuToggle && mobileUserMenuDropdown) {
      mobileUserMenuToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          mobileUserMenuDropdown.classList.toggle('show');
      });
      document.addEventListener('click', (e) => {
          if (!mobileUserMenuToggle.contains(e.target) && !mobileUserMenuDropdown.contains(e.target)) {
              mobileUserMenuDropdown.classList.remove('show');
          }
      });
  }

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  }

  async function fetchUserProfile(userId, token) {
    if (!userId || !token) return null;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching user profile:", error);
      showAlert("Failed to fetch user profile.", "error");
      return null;
    }
  }

  const decodedToken = token ? parseJwt(token) : null;
  const userId = decodedToken ? decodedToken.id : null;

  if (userId && token) {
    fetchUserProfile(userId, token).then((userProfile) => {
      if (userProfile) {
        if (userNameSpan) {
          userNameSpan.textContent = `${userProfile.first_name} ${userProfile.last_name}`;
        }
        if (welcomeHeader) {
          welcomeHeader.textContent = `مرحباً بك ${userProfile.first_name} ${userProfile.last_name}!`;
        }
        if (userAvatar) {
          userAvatar.src =
            userProfile.profile_image_url ||
            "https://images.icon-icons.com/2483/PNG/512/user_icon_149851.png";
        }
      }
    });
  }

  if (sidebarToggle && sidebar && dashboardContainer) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      dashboardContainer.classList.toggle("sidebar-collapsed");
    });
  }

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      taskSections.forEach((section) => {
        section.style.display = "none";
      });
      const selectedSection = document.getElementById(targetId + "-section");
      if (selectedSection) {
        selectedSection.style.display = "block";
      }
      sidebarLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  if (userMenuToggle && userMenuDropdown) {
    userMenuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenuDropdown.classList.toggle("show");
    });
    document.addEventListener("click", () => {
      userMenuDropdown.classList.remove("show");
    });
  }

  async function fetchTasks() {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const tasks = await response.json();
      renderCurrentTasks(tasks);
      renderCompletedTasks(tasks);
      renderDeletedTasks(tasks);
      renderStatistics(tasks); // Call the new statistics rendering function
    } catch (err) {
      console.error("Error fetching tasks:", err);
      showAlert("Failed to fetch tasks.", "error");
    }
  }

  function renderCurrentTasks(tasks) {
    if (!currentTasksContainer) return;
    currentTasksContainer.innerHTML = "";
    const currentTasks = tasks.filter((task) => !task.completed && !task.deleted_at);
    if (!currentTasks.length) {
      currentTasksContainer.innerHTML = '<p class="no-tasks">لا توجد مهام حالية لعرضها.</p>';
      return;
    }
    const cardList = document.createElement("div");
    cardList.className = "task-card-list";
    currentTasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card";
      card.innerHTML = `
        <div class="task-card-header">
          <h3 class="task-title">${task.title}</h3>
          <span class="task-date">${new Date(task.created_at).toLocaleDateString("ar-EG")}</span>
        </div>
        <div class="task-card-body">
          <p class="task-desc">${task.description || ""}</p>
          <div class="task-details-grid">
            ${task.start_date ? `<div><strong>تاريخ البداية:</strong> ${new Date(task.start_date).toLocaleDateString("ar-EG")}</div>` : ''}
            ${task.end_date ? `<div><strong>تاريخ النهاية:</strong> ${new Date(task.end_date).toLocaleDateString("ar-EG")}</div>` : ''}
            ${task.time ? `<div><strong>الوقت:</strong> ${task.time}</div>` : ''}
            ${task.notes ? `<div><strong>ملاحظات:</strong> ${task.notes}</div>` : ''}
          </div>
        </div>
        <div class="task-card-actions">
          <button class="btn-done" data-id="${task.id}"><i class="fas fa-check"></i> تمت</button>
          <button class="btn-edit" data-id="${task.id}"><i class="fas fa-edit"></i> تعديل</button>
          <button class="btn-delete" data-id="${task.id}"><i class="fas fa fa-trash"></i> حذف</button>
        </div>
      `;
      cardList.appendChild(card);
    });
    currentTasksContainer.appendChild(cardList);
  }

  function renderCompletedTasks(tasks) {
    const completedTasksContainer = document.getElementById("completedTaskList");
    if (!completedTasksContainer) return;
    completedTasksContainer.innerHTML = "";
    const completedTasks = tasks.filter((task) => task.completed);
    if (!completedTasks.length) {
      completedTasksContainer.innerHTML = '<p class="no-tasks">لا توجد مهام مكتملة بعد.</p>';
      return;
    }
    const cardList = document.createElement("div");
    cardList.className = "task-card-list completed-card-list";
    completedTasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card completed";
      card.innerHTML = `
        <div class="task-card-header">
          <h3 class="task-title">${task.title}</h3>
          <span class="task-date">${new Date(task.completed_at).toLocaleDateString("ar-EG")}</span>
        </div>
        <div class="task-card-body">
          <p class="task-desc">${task.description || ""}</p>
          <div class="task-details-grid">
            ${task.start_date ? `<div><strong>تاريخ البداية:</strong> ${new Date(task.start_date).toLocaleDateString("ar-EG")}</div>` : ''}
            ${task.end_date ? `<div><strong>تاريخ النهاية:</strong> ${new Date(task.end_date).toLocaleDateString("ar-EG")}</div>` : ''}
            ${task.time ? `<div><strong>الوقت:</strong> ${task.time}</div>` : ''}
            ${task.notes ? `<div><strong>ملاحظات:</strong> ${task.notes}</div>` : ''}
            <div><strong>الحالة:</strong> مكتملة</div>
          </div></p>
        </div>
      `;
      cardList.appendChild(card);
    });
    completedTasksContainer.appendChild(cardList);
  }

  function renderDeletedTasks(tasks) {
    const deletedTasksContainer = document.getElementById("deletedTaskList");
    if (!deletedTasksContainer) return;
    deletedTasksContainer.innerHTML = "";
    const deletedTasks = tasks.filter((task) => task.deleted_at);
    if (!deletedTasks.length) {
      deletedTasksContainer.innerHTML = '<p class="no-tasks">لا توجد مهام محذوفة.</p>';
      return;
    }
    const cardList = document.createElement("div");
    cardList.className = "task-card-list deleted-card-list";
    deletedTasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card deleted";
      card.innerHTML = `
        <div class="task-card-header">
          <h3 class="task-title">${task.title}</h3>
          <span class="task-date">تاريخ الحذف: ${new Date(task.deleted_at).toLocaleDateString("ar-EG")}</span>
        </div>
        <div class="task-card-body">
          <p class="task-desc">${task.description || ""}</p>
          <div class="task-details-grid">
            ${task.start_date ? `<div><strong>تاريخ البداية:</strong> ${new Date(task.start_date).toLocaleDateString("ar-EG")}</div>` : ''}
            ${task.end_date ? `<div><strong>تاريخ النهاية:</strong> ${new Date(task.end_date).toLocaleDateString("ar-EG")}</div>` : ''}
            ${task.time ? `<div><strong>الوقت:</strong> ${task.time}</div>` : ''}
            ${task.notes ? `<div><strong>ملاحظات:</strong> ${task.notes}</div>` : ''}
            <div><strong>الحالة:</strong> محذوفة</div>
          </div>
        </div>
      `;
      cardList.appendChild(card);
    });
    deletedTasksContainer.appendChild(cardList);
  }

  if (addTaskForm) {
    addTaskForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const taskName = document.getElementById("taskName").value;
      const taskDetails = document.getElementById("taskDetails").value;
      const taskStartDate = document.getElementById("taskStartDate").value;
      const taskEndDate = document.getElementById("taskEndDate").value;
      const taskTime = document.getElementById("taskTime").value;
      const taskNotes = document.getElementById("taskNotes").value;

      try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: taskName,
            description: taskDetails,
            start_date: taskStartDate,
            end_date: taskEndDate,
            time: taskTime,
            notes: taskNotes,
          }),
        });
        if (!response.ok) throw new Error("Failed to add task");
        addTaskForm.reset();
        fetchTasks();
        showAlert("تم إضافة المهمة بنجاح!", "success");
      } catch (err) {
        console.error("Error adding task:", err);
        showAlert("خطأ في إضافة المهمة!", "error");
      }
    });
  }

  document.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if(!button) return;
    const id = button.dataset.id;

    if(button.classList.contains('btn-done')){
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}/done`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to mark as done");
        fetchTasks();
        showAlert("تم إكمال المهمة بنجاح!", "success");
      } catch (err) {
        showAlert("خطأ في إكمال المهمة!", "error");
      }
    }

    if(button.classList.contains('btn-edit')){
      if(!id) return;
      showEditModal(id);
    }

    if(button.classList.contains('btn-delete')){
      if(!id) return;
      showDeleteConfirm(id);
    }
  });

  function showDeleteConfirm(id) {
    const deleteModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    const closeButton = deleteModal.querySelector('.close-button');

    deleteModal.style.display = 'block';

    confirmDeleteBtn.onclick = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete task');
            deleteModal.style.display = 'none';
            fetchTasks();
            showAlert('تم حذف المهمة بنجاح!', 'success');
        } catch (err) {
            showAlert('خطأ في حذف المهمة!', 'error');
        }
    };

    cancelDeleteBtn.onclick = () => {
        deleteModal.style.display = 'none';
    };

    closeButton.onclick = () => {
        deleteModal.style.display = 'none';
    };
  }

  function showEditModal(id) {
    const modal = document.getElementById('editTaskModal');
    const form = document.getElementById('editTaskForm');
    const closeButton = modal.querySelector('.close-button');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const placeholder = modal.querySelector('.modal-placeholder');

    modal.classList.add('loading');
    modal.style.display = 'block';

    fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(task => {
        if (task) {
            document.getElementById('editTaskId').value = task.id;
            document.getElementById('editTaskName').value = task.title;
            document.getElementById('editTaskDetails').value = task.description || '';
            document.getElementById('editTaskStartDate').value = task.start_date ? task.start_date.split('T')[0] : '';
            document.getElementById('editTaskEndDate').value = task.end_date ? task.end_date.split('T')[0] : '';
            document.getElementById('editTaskTime').value = task.time || '';
            document.getElementById('editTaskNotes').value = task.notes || '';
            modal.classList.remove('loading');
        }
    });

    form.onsubmit = async (e) => {
        e.preventDefault();
        const taskId = document.getElementById('editTaskId').value;
        const title = document.getElementById('editTaskName').value;
        const description = document.getElementById('editTaskDetails').value;
        const start_date = document.getElementById('editTaskStartDate').value;
        const end_date = document.getElementById('editTaskEndDate').value;
        const time = document.getElementById('editTaskTime').value;
        const notes = document.getElementById('editTaskNotes').value;

        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, start_date, end_date, time, notes })
            });
            if (!response.ok) throw new Error('Failed to update task');
            modal.style.display = 'none';
            fetchTasks();
            showAlert('تم تحديث المهمة بنجاح!', 'success');
        } catch (err) {
            showAlert('خطأ في تحديث المهمة!', 'error');
        }
    };

    closeButton.onclick = () => {
        modal.style.display = 'none';
    };

    cancelEditBtn.onclick = () => {
        modal.style.display = 'none';
    };
  }

  const signOutLink = document.getElementById("signOutLink");
  const mobileSignOutLink = document.getElementById("mobileSignOutLink");

  function handleSignOut(e) {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.setItem("logoutSuccess", "true");
      window.location.href = "login.html";
  }

  if (signOutLink) {
    signOutLink.addEventListener("click", handleSignOut);
  }
  if (mobileSignOutLink) {
    mobileSignOutLink.addEventListener("click", handleSignOut);
  }

  fetchTasks();
});

  function renderStatistics(tasks) {
    // Clear previous charts if any
    ['taskStatusChart', 'taskCountsChart', 'tasksByMonthChart', 'completedTasksOverTimeChart'].forEach(chartId => {
      const chartElement = document.getElementById(chartId);
      if (chartElement && chartElement.chart) {
        chartElement.chart.destroy();
      }
    });

    const totalTasks = tasks.length;
    const currentTasks = tasks.filter(task => !task.completed && !task.deleted_at).length;
    const completedTasks = tasks.filter(task => task.completed && !task.deleted_at).length;
    const deletedTasks = tasks.filter(task => task.deleted_at).length;

    // Update summary cards
    document.getElementById('totalTasksCount').textContent = totalTasks;
    document.getElementById('currentTasksCount').textContent = currentTasks;
    document.getElementById('completedTasksCount').textContent = completedTasks;
    document.getElementById('deletedTasksCount').textContent = deletedTasks;

    // Chart 1: Doughnut Chart (Task Status Overview)
    const taskStatusCtx = document.getElementById('taskStatusChart').getContext('2d');
    if (taskStatusCtx) {
      taskStatusCtx.canvas.chart = new Chart(taskStatusCtx, {
        type: 'doughnut',
        data: {
          labels: ['المهام الحالية', 'المهام المكتملة', 'المهام المحذوفة'],
          datasets: [{
            data: [currentTasks, completedTasks, deletedTasks],
            backgroundColor: ['#6366f1', '#22c55e', '#ef4444'],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
              }
            },
            title: {
              display: true,
              text: 'نظرة عامة على حالة المهام',
              color: getComputedStyle(document.documentElement).getPropertyValue('--heading-color')
            }
          }
        }
      });
    }

    // Chart 2: Bar Chart (Task Counts)
    const taskCountsCtx = document.getElementById('taskCountsChart').getContext('2d');
    if (taskCountsCtx) {
      taskCountsCtx.canvas.chart = new Chart(taskCountsCtx, {
        type: 'bar',
        data: {
          labels: ['إجمالي المهام', 'المهام الحالية', 'المهام المكتملة', 'المهام المحذوفة'],
          datasets: [{
            label: 'عدد المهام',
            data: [totalTasks, currentTasks, completedTasks, deletedTasks],
            backgroundColor: [
              'rgba(99, 102, 241, 0.6)', // Primary color
              'rgba(255, 159, 64, 0.6)', // Orange
              'rgba(34, 197, 94, 0.6)',  // Green
              'rgba(239, 68, 68, 0.6)'   // Red
            ],
            borderColor: [
              'rgba(99, 102, 241, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(34, 197, 94, 1)',
              'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
              labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
              }
            },
            title: {
              display: true,
              text: 'إحصائيات المهام',
              color: getComputedStyle(document.documentElement).getPropertyValue('--heading-color')
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
              }
            },
            x: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
              }
            }
          }
        }
      });
    }

    // Chart 3: Line Chart (Tasks Created Over Time - Monthly)
    const tasksByMonth = {};
    tasks.forEach(task => {
      const date = new Date(task.created_at);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      tasksByMonth[monthYear] = (tasksByMonth[monthYear] || 0) + 1;
    });

    const sortedMonths = Object.keys(tasksByMonth).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    const tasksByMonthData = sortedMonths.map(month => tasksByMonth[month]);

    const tasksByMonthCtx = document.getElementById('tasksByMonthChart').getContext('2d');
    if (tasksByMonthCtx) {
      tasksByMonthCtx.canvas.chart = new Chart(tasksByMonthCtx, {
        type: 'line',
        data: {
          labels: sortedMonths,
          datasets: [{
            label: 'المهام التي تم إنشاؤها',
            data: tasksByMonthData,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            fill: true,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
              }
            },
            title: {
              display: true,
              text: 'المهام التي تم إنشاؤها بمرور الوقت',
              color: getComputedStyle(document.documentElement).getPropertyValue('--heading-color')
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
              }
            },
            x: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
              }
            }
          }
        }
      });
    }

    // Chart 4: Bar Chart (Completed Tasks Over Time - Monthly)
    const completedTasksMonthly = {};
    tasks.filter(task => task.completed && task.completed_at).forEach(task => {
      const date = new Date(task.completed_at);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      completedTasksMonthly[monthYear] = (completedTasksMonthly[monthYear] || 0) + 1;
    });

    const sortedCompletedMonths = Object.keys(completedTasksMonthly).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    const completedTasksMonthlyData = sortedCompletedMonths.map(month => completedTasksMonthly[month]);

    const completedTasksOverTimeCtx = document.getElementById('completedTasksOverTimeChart').getContext('2d');
    if (completedTasksOverTimeCtx) {
      completedTasksOverTimeCtx.canvas.chart = new Chart(completedTasksOverTimeCtx, {
        type: 'bar',
        data: {
          labels: sortedCompletedMonths,
          datasets: [{
            label: 'المهام المكتملة',
            data: completedTasksMonthlyData,
            backgroundColor: 'rgba(34, 197, 94, 0.6)', // Green
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
              }
            },
            title: {
              display: true,
              text: 'المهام المكتملة بمرور الوقت',
              color: getComputedStyle(document.documentElement).getPropertyValue('--heading-color')
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
              }
            },
            x: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
              }
            }
          }
        }
      });
    }
  }
