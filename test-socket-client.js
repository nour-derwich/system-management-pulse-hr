// test-socket-client.js
const { io } = require("socket.io-client");

// Connect to your Socket.io server (adjust the URL to match your server)
const socket = io("http://localhost:3000", {
  auth: { token: "test-token" }
});

// Connection events
socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
  
  // Join a test board
  socket.emit("join-board", "test-board-123");
  console.log("Join board request sent");
  
  // Create a test task
  setTimeout(() => {
    console.log("Sending create task request...");
    socket.emit("create-task", {
      boardId: "test-board-123",
      columnId: "column-1",
      task: {
        title: "Test Task",
        description: "This is a test task"
      }
    });
  }, 2000);
});

// Listen for server events
socket.on("task-created", (data) => {
  console.log("Task created event received:", data);
});

socket.on("board-joined", (data) => {
  console.log("Successfully joined board:", data.boardId);
});

socket.on("error", (error) => {
  console.error("Error received:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

// Keep the script running
process.stdin.resume();
console.log("Socket test client started. Press Ctrl+C to exit.");