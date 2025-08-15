class TaskStorage {
  static saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  static loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  }
  
  static clearTasks() {
    localStorage.removeItem('tasks');
  }
}