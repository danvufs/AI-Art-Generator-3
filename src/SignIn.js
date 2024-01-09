import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import logo from './logo512.png';
import './SignIn.css';

// const images = [
//   require('./images/1.png'),
//   require('./images/2.png'),
//   require('./images/3.png'),
//   require('./images/4.png'),
//   require('./images/5.png'),
//   require('./images/6.png'),
// ];

// Define plan limits
const planLimits = {
  trial: 5,
  basic: 10,
  premium: 50
};

// Styled components
const SignInContainer = styled(Paper)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  gap: '20px',
  padding: '20px',
  background: 'transparent',
  zIndex: 2,
  position: 'relative',
  backgroundColor: '#1C1C1E;',
});

const SignInButton = styled(Button)({
  padding: '10px 50px',
  fontSize: '1rem', // Use relative units
  fontWeight: 'bold',
  boxShadow: 'none',
  textTransform: 'none',
  '&:hover': {
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  },
});

const TextBackdrop = styled('div')({
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  padding: '20px',
  borderRadius: '10px',
  width: '90%', // Full width, let the container handle the max size
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto', // Center it
});

const StyledTypography = styled(Typography)({
  textShadow: '0px 0px 8px rgba(0, 0, 0, 0.8)',
  color: 'yellow',
  textAlign: 'center',
});

const IntroText = styled('div')({
  color: 'white',
  textAlign: 'center',
  maxWidth: '90%', // Allow some margin on the sides
  margin: '0 auto 20px',
  padding: '10px',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '8px',
  backdropFilter: 'blur(2px)',
});

// Helper function to create a user profile document
const createUserProfileDocument = async (userAuth) => {
  if (!userAuth) return;

  const firestore = getFirestore();
  const userRef = doc(firestore, 'users', userAuth.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const createdAt = new Date();
    try {
      await setDoc(userRef, {
        email: userAuth.email,
        imageCount: 0,
        imageLimit: planLimits.trial, // Set the initial limit for trial users
        isAdmin: false,
        lastGenerated: createdAt.toISOString().split('T')[0],
        plan: "trial"
      });
    } catch (error) {
      console.error('Error creating user profile', error.message);
    }
  }
};

const SignIn = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        createUserProfileDocument(user); // Create a user profile document upon sign-in
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await createUserProfileDocument(user); // Create a user profile document upon sign-in
      navigate('/');
    } catch (error) {
      console.error('SignIn error:', error);
    }
  };

  return (
    <div className="slideshow-background">
        {/* <img src={logo} alt="Logo" className="logo" /> */}
      {/* {images.map((image, index) => (
        <img key={index} src={image} alt="Background" className="background-image" />
      ))} */}
      <SignInContainer elevation={4}>
        <TextBackdrop>
          {/* <img src={logo} alt="Logo" className="logo" /> */}
          <StyledTypography variant="h4" gutterBottom>
            Welcome to AI Tattoo Generator!
          </StyledTypography>
          <IntroText>
            {/* Introduction Text */}
            <Typography variant="body1" style={{ marginBottom: '10px' }}>
              Discover the artistry of ink with AI Tattoo Generator. Our platform uses advanced AI to help you create and visualize unique tattoo designs. Join us and unleash your creativity!
            </Typography>
            <Typography variant="body2">
              Whether you're a tattoo artist seeking inspiration or a tattoo enthusiast looking for your next piece, AI Tattoo Generator is the perfect canvas to sketch out your ideas.
            </Typography>
          </IntroText>
          <StyledTypography variant="h6" gutterBottom>
          <p>Please sign in with Google to continue:</p>
            </StyledTypography>
          <SignInButton variant="contained" color="primary" onClick={handleSignIn}>
            Sign In with Google
          </SignInButton>
        </TextBackdrop>
      </SignInContainer>
    </div>
  );
};

export default SignIn;


// // src/SignIn.js
// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { auth, googleProvider } from './firebase';
// import { signInWithPopup } from 'firebase/auth'; // Import signInWithPopup
// import Button from '@mui/material/Button';
// import 'firebaseui/dist/firebaseui.css';

// const SignIn = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(user => {
//       if (user) {
//         navigate('/');
//       }
//     });
//     return () => unsubscribe();
//   }, [navigate]);

//   const handleSignIn = async () => {
//     try {
//       const result = await signInWithPopup(auth, googleProvider);
//       console.log('User signed in: ', result.user);
//       navigate('/');
//     } catch (error) {
//       console.error('SignIn error:', error);
//     }
//   };

//   return (
//     <div style={{ marginTop: '50px', textAlign: 'center' }}>
//       <h1>Welcome to Art Generator!</h1>
//       <p>Please sign in with Google to continue:</p>
//       <Button variant="contained" color="primary" onClick={handleSignIn}>
//         Sign In with Google
//       </Button>
//     </div>
//   );
// };

// export default SignIn;
