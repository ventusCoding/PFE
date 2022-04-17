const User = require('./Models/userModel');
const AppError = require('./utils/appError');
const jwt = require('jsonwebtoken');



const socketMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth['token'];

    const auth = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(auth.id);

    if (user) {
      socket.user = user;
      next();
    } else {
      next(new AppError('User not found', 401));
    }
  } catch (err) {
    next(new AppError('Provide JWT', 401));
    console.log('errorrrooor', err);
  }
};

const socketGateway = (socket,io) => {
  socket.on('joinRoom', (data) => {
    socket.join(data.room);
    socket.to(data.room).emit('joinedRoom', {...data , user: socket.user});

    console.log(
      'user joined room',
      socket.user.name,
      ' joined room ',
      data.room
    );
  });

  socket.on('leaveRoom', (data) => {
    
    socket.leave(data.room);
    io.to(data.room).emit('leftRoom', socket.user);
  });

  socket.on('updatePosition', (data) => {
    socket.to(data.room).emit(`onUpdatePosition-${socket.user.id}`, {...data});
  });

  socket.on('updatePlayerList', (data) => {
      console.log('updatePlayerList', socket.id);
    socket.to(data.room).emit('playersList', {
      user: socket.user,
      rotation:data.rotation,
      position: data.position,
    });
  });
};

module.exports = { socketMiddleware, socketGateway };
