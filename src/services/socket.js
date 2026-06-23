import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    socket = null;

    connect() {
        this.socket = io(SOCKET_URL);
        console.log('Connected to socket');
    }

    joinRoom(roomId) {
        if (this.socket) this.socket.emit('join-room', roomId);
    }

    onExpenseAdded(callback) {
        if (this.socket) this.socket.on('expense-added', callback);
    }

    onMessageReceived(callback) {
        if (this.socket) this.socket.on('message-received', callback);
    }

    onNewMember(callback) {
        if (this.socket) this.socket.on('new-member', callback);
    }

    emitExpense(roomId, expense) {
        if (this.socket) this.socket.emit('new-expense', { roomId, expense });
    }

    emitMessage(roomId, message) {
        if (this.socket) this.socket.emit('new-message', { roomId, message });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();
