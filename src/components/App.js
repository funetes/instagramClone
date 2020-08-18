import React, { useState, useEffect } from 'react';
import './App.css';
import db from '../Firebase/db';
import auth from '../Firebase/auth';
import Post from './Post';
import Modal from '@material-ui/core/Modal';
import { Button } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import ImageUpload from './Post/ImageUpload';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}
const useStyles = makeStyles(theme =>
  createStyles({
    paper: {
      position: 'absolute',
      width: 300,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      display: 'flex',
      justifyContent: 'center',
    },
  })
);

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  const [open, setOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    // user login, logout, create user, etc..
    const unsubscribe = auth.onAuthStateChanged(authUser => {
      if (authUser) {
        // logged in
        setUser(authUser);
      } else {
        // logged out
        setUser(null);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [user, username]);

  useEffect(() => {
    db.collection('posts')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapShot => {
        setPosts(
          snapShot.docs.map(doc => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
  }, []);
  const signUp = e => {
    e.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(authUser => {
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .catch(error => alert(error.message));
  };

  const signIn = e => {
    e.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .catch(error => alert(error.message));
    setSignInOpen(false);
  };
  const logOut = () => auth.signOut();

  return (
    <div className='app'>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className='app__signup'>
            <center>
              <img
                src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/640px-Instagram_logo.svg.png'
                alt='instargram'
                className='app__headerImage'
              />
            </center>
            <Input
              placeholder='username'
              type='text'
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <Input
              placeholder='email'
              type='text'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              placeholder='password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button type='submit' onClick={signUp}>
              Sign Up
            </Button>
          </form>
        </div>
      </Modal>
      <Modal open={signInOpen} onClose={() => setSignInOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className='app__signup'>
            <center>
              <img
                src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/640px-Instagram_logo.svg.png'
                alt='instargram'
                className='app__headerImage'
              />
            </center>
            <Input
              placeholder='email'
              type='text'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              placeholder='password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button type='submit' onClick={signIn}>
              Sign In
            </Button>
          </form>
        </div>
      </Modal>

      <div className='app__header'>
        <img
          src='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/640px-Instagram_logo.svg.png'
          alt='instargram'
          className='app__headerImage'
        />
        {user ? (
          <Button type='button' onClick={logOut}>
            Logout
          </Button>
        ) : (
          <div className='app__loginContainer'>
            <Button type='button' onClick={() => setOpen(true)}>
              Sign Up
            </Button>
            <Button type='button' onClick={() => setSignInOpen(true)}>
              Sign In
            </Button>
          </div>
        )}
      </div>
      <div className='app__posts'>
        {posts?.map(({ id, post }) => (
          <Post
            key={id}
            postId={id}
            user={user}
            imageURL={post.imageUrl}
            username={post.username}
            caption={post.caption}
          />
        ))}
      </div>

      <div className='app__imageUpload'>
        {user?.displayName ? (
          <ImageUpload username={user?.displayName} />
        ) : (
          <h3>login please</h3>
        )}
      </div>
    </div>
  );
}

export default App;
