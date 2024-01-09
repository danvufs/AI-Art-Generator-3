// // //App.js


import React, { useState, useEffect } from "react";
import { OpenAI } from "openai";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import BottomNavigation from "@mui/material/BottomNavigation";
// import BottomNavigationAction from "@mui/material/BottomNavigationAction";
// import LinkedInIcon from "@mui/icons-material/LinkedIn";
// import GitHubIcon from "@mui/icons-material/GitHub";
import { Analytics } from "@vercel/analytics/react";
//import Box from '@mui/material/Box';
import "./App.css";

// Helper function to get today's date as a string
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

function App() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [style, setStyle] = useState("🎨 Oil Painting");
  const [mood, setMood] = useState("😌 Serene");
  const [activeTab, setActiveTab] = useState("manual");
  const [imageURL, setImageURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(false);
  const [revisedPrompt, setRevisedPrompt] = useState("");

  // Replace with your own OpenAI API key
  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const [dailyLimitReached, setDailyLimitReached] = useState(false);

  useEffect(() => {
    const today = getTodayString();
    const imageCount = parseInt(localStorage.getItem(today), 10) || 0;
    setDailyLimitReached(imageCount >= 5);
  }, []);

  const incrementImageCount = () => {
    const today = getTodayString();
    const imageCount = parseInt(localStorage.getItem(today), 10) || 0;
    localStorage.setItem(today, imageCount + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if daily limit is reached
    if (dailyLimitReached) {
      setErrorMessage(
        "Daily limit of 5 images reached. Please try again tomorrow."
      );
      setError(true);
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);

    const combinedPrompt =
      activeTab === "manual"
        ? inputPrompt
        : `${inputPrompt}, Style: ${style}, Mood: ${mood}`;

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: combinedPrompt,
        n: 1,
        size: "1024x1024",
      });
      console.log("Response from OpenAI:", response);
      setRevisedPrompt(response.data[0].revised_prompt);
      setImageURL(response.data[0].url);

      // Increment image count
      incrementImageCount();
      const today = getTodayString();
      const imageCount = parseInt(localStorage.getItem(today), 10) || 0;
      if (imageCount >= 5) {
        setDailyLimitReached(true);
      }
    } catch (error) {
      console.error("Error generating the image:", error);
      // Extracting the error message properly from the response
      let errorMessage =
        "An unexpected error occurred with the API. Please try again later";
      if (error instanceof Error) {
        // Check if the error is an instance of the Error class
        errorMessage += ` ${error.message}`; // Append the actual error message from the API
      }
      setErrorMessage(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputPrompt("");
    setStyle("🎨 Oil Painting");
    setMood("😌 Serene");
    setActiveTab("manual");
    setImageURL("");
    setIsLoading(false);
    setSnackbarOpen(false);
    setRevisedPrompt("");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="App">
      <AppBar position="fixed" className="AppBar">
        <Toolbar>
          <img src="/logo512.png" alt="Logo" className="App-logo" />
          <Typography
            variant="h6"
            color="inherit"
            noWrap
            style={{ flexGrow: 1 }}
          >
            AI Art Generator
          </Typography>
        </Toolbar>
      </AppBar>
      <div className="container">
        {/* <h1>DALL·E 3 Art Generator</h1> */}
        {/* Tab Buttons */}
        <div className="tabs-container">
          <Button
            variant={activeTab === "manual" ? "contained" : "outlined"}
            onClick={() => setActiveTab("manual")}
            style={{ marginRight: "10px" }} // Add right margin to the first button
          >
            Manual Prompt
          </Button>
          <Button
            variant={activeTab === "predefined" ? "contained" : "outlined"}
            onClick={() => setActiveTab("predefined")}
          >
            Predefined Options
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="input-form">
          {activeTab === "manual" && (
            <TextField
              fullWidth
              label="Enter a description..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
            />
          )}

          {activeTab === "predefined" && (
            <>
              <TextField
                fullWidth
                label="Enter a base description..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
              />
              {/* ... style and mood selectors */}
              {activeTab === "predefined" && (
                <>
                  <div className="select-row">
                    <div className="select-wrapper">
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="option-select"
                      >
                        <option value="🎨 Oil Painting">🎨 Oil Painting</option>
                        <option value="🖌️ Watercolor">🖌️ Watercolor</option>
                        <option value="💻 Digital Art">💻 Digital Art</option>
                      </select>
                    </div>
                    <div className="select-wrapper">
                      <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="option-select"
                      >
                        <option value="😌 Serene">😌 Serene</option>
                        <option value="🌀 Chaotic">🌀 Chaotic</option>
                        <option value="🔮 Mystical">🔮 Mystical</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          {/* Generate Button */}

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={24} color="secondary" />
              ) : null
            } // Show loading indicator as the startIcon when loading
          // style={{
          //   maxWidth: '200px',
          //   alignItems: 'center',
          // }}
          >
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </form>

        {/* {isLoading && <CircularProgress />} */}
        <div className="revised-prompt-container">
          <p className="revised-prompt">{revisedPrompt}</p>
        </div>
        {/* Image Display */}
        {imageURL && (
          <div className="image-container">
            <img
              src={imageURL}
              alt="Generated from OpenAI"
              className="generated-image"
            />
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReset}
              style={{
                marginTop: "20px",
                marginLeft: "5px",
                fontSize: "1rem",
                borderRadius: "4px",
              }}
            >
              Reset
            </Button>
          </div>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={errorMessage}
        />
      </div>
      <BottomNavigation showLabels className="BottomNavigation" style={{ backgroundColor: '#1976D2', color: 'white' }}>

        {/* Copyright Information */}
        <div style={{ flexGrow: 1, textAlign: 'center', padding: '15px', color: 'white' }}>
          © {new Date().getFullYear()} AI Art Generator. All rights reserved.
        </div>

        {/* <BottomNavigationAction label="LinkedIn" icon={<LinkedInIcon />} />
  <BottomNavigationAction label="GitHub" icon={<GitHubIcon />} /> */}
      </BottomNavigation>
      <Analytics />
    </div>
  );
}

export default App;

// import { increment } from 'firebase/firestore';
// import { getFirestore } from 'firebase/firestore';
// import React, { useState, useEffect } from 'react';
// import { OpenAI } from 'openai';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import CircularProgress from '@mui/material/CircularProgress';
// import Snackbar from '@mui/material/Snackbar';
// import AppBar from '@mui/material/AppBar';
// import Toolbar from '@mui/material/Toolbar';
// import Typography from '@mui/material/Typography';
// import IconButton from '@mui/material/IconButton';
// import TranslateIcon from '@mui/icons-material/Translate';
// import BottomNavigation from '@mui/material/BottomNavigation';
// import BottomNavigationAction from '@mui/material/BottomNavigationAction';
// import LinkedInIcon from '@mui/icons-material/LinkedIn';
// import GitHubIcon from '@mui/icons-material/GitHub';
// import CreatableSelect from 'react-select/creatable';
// import { Analytics } from '@vercel/analytics/react';
// import './App.css';
// import { auth } from './firebase';
// import SignIn from './SignIn';
// import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
// // Import the initialized 'app' from firebase.js
// import { app } from './firebase';
// import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useRoutes } from 'react-router-dom';
// import AdminPage from './AdminPage';
// import MainPage from './MainPage';

// // Initialize Firestore with the Firebase app
// const firestore = getFirestore(app);

// // Helper function to get today's date as a string
// const getTodayString = () => {
//   const today = new Date();
//   return today.toISOString().split('T')[0];
// };

// // Prompts in both English and Vietnamese
// const prompts = {
//   en: {
//     describeTattoo: "Describe your tattoo idea",
//     pickStyle: "Pick a style...",
//     colorPreference: "Color Preference",
//     generateTattoo: "Generate Tattoo",
//     placements: {
//       back: "Back",
//       arm: "Arm",
//       hand: "Hand",
//       backhand: "the back of a hand",
//       leg: "Leg",
//       chest: "Chest",
//       neck: "Neck",
//       wrist: "Wrist",
//       ankle: "Ankle",
//       shoulder: "Shoulder",
//       foot: "Foot",
//       finger: "Finger",
//       ear: "Ear",
//       hip: "Hip",
//       ribcage: "Ribcage",
//       other: "Other",
//     },
//     size: {
//       small: "1cm",
//       medium: "1.5cm",
//       large: "2cm",
//     },
//     styles: {
//       traditional: "Traditional",
//       neoTraditional: "Neo-Traditional",
//       japanese: "Japanese",
//       tribal: "Tribal",
//       newSchool: "New School",
//       blackAndGrey: "Black and Grey",
//       realism: "Realism",
//       scriptLettering: "Script/Lettering",
//       watercolor: "Watercolor",
//       geometric: "Geometric",
//       other: "Other",

//     },
//     colors: {
//       colorful: "Colorful",
//       blackAndGrey: "Black and Grey",
//       black: "Black",
//       other: "Other",
//     },
//     flagIcon: "./ca.png",

//     combinedPrompt: (tattooDescription, tattooStyle, colorPreference, tattooPlacement, tattooSize) =>
//       `A ${tattooSize}-size tattoo of a ${colorPreference} ${tattooDescription} on the ${tattooPlacement}, ` +
//       `styled in ${tattooStyle}.` +
//       `The tattoo MUST be hightly detailed and proportionate, strictly adhering to the exact SMALL SCALE.` +
//       `It must be precisely 1cm to ensure it fits perfectly on the designated spot without exceeding the size limit.`,
//   },

//   vi: {
//     describeTattoo: "Mô tả ý tưởng hình xăm của bạn",
//     pickStyle: "Chọn phong cách...",
//     colorPreference: "Chọn màu sắc",
//     generateTattoo: "Tạo Hình Xăm",
//     placements: {
//       back: "Lưng",
//       arm: "Cánh tay",
//       hand: "Tay",
//       backhand: "Mu bàn tay",
//       leg: "Chân",
//       chest: "Ngực",
//       neck: "Cổ",
//       wrist: "Cổ tay",
//       ankle: "Mắt cá chân",
//       shoulder: "Vai",
//       foot: "Bàn chân",
//       finger: "Ngón tay",
//       ear: "Tai",
//       hip: "Hông",
//       ribcage: "Xương sườn",
//       other: "Khác",
//     },
//     size: {
//       small: "1cm",
//       medium: "1.5cm",
//       large: "2cm",
//     },
//     styles: {
//       traditional: "Truyền thống",
//       neoTraditional: "Hình xăm truyền thống",
//       japanese: "Nhật Bản",
//       tribal: "Bộ lạc",
//       newSchool: "Trường mới",
//       blackAndGrey: "Đen và xám",
//       realism: "Hiện thực",
//       scriptLettering: "Kịch bản / Chữ viết",
//       watercolor: "Màu nước",
//       geometric: "Hình học",
//       other: "Khác",
//     },
//     colors: {
//       colorful: "Nhiều màu",
//       blackAndGrey: "Đen và xám",
//       black: "Đen",
//       other: "Khác",
//     },
//     flagIcon: "./vn.png",

//     combinedPrompt: (tattooDescription, tattooStyle, colorPreference, tattooPlacement, tattooSize) =>
//   `Một hình xăm ${tattooSize} của ${colorPreference} ${tattooDescription} trên ${tattooPlacement}, ` +
//   `theo phong cách ${tattooStyle}.` +
//   `Hình xăm PHẢI được chi tiết và cân đối, tuân thủ chặt chẽ với QUY MÔ NHỎ CHÍNH XÁC.` +
//   `Nó phải chính xác 1cm để đảm bảo phù hợp hoàn hảo với vị trí đã chỉ định mà không vượt quá giới hạn kích thước.`,
//   },
// };

// const defaultDescriptions = {
//   en: [
//     "A beautiful bird",
//   ],
//   vi: [
//     "Một con hổ đang cười",
//   ]
// };

// function App() {
//   const [user, setUser] = useState(null);
//   //const firestore = getFirestore(app);
//   const [inputPrompt, setInputPrompt] = useState("");
//   const [imageURL, setImageURL] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [error, setError] = useState(false);
//   const [revisedPrompt, setRevisedPrompt] = useState("");
//   const [language, setLanguage] = useState('en');
//   // Use the language state to set the initial tattoo description
//   const [tattooDescription, setTattooDescription] = useState(defaultDescriptions[language]);
//   const [customDescriptions, setCustomDescriptions] = useState([]);
//   const [isOnAdminPage, setIsOnAdminPage] = useState(false);
//   // Function to toggle language between English and Vietnamese
//   const toggleLanguage = () => {
//     setLanguage(prevLang => (prevLang === 'en' ? 'vi' : 'en'));
//   };
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [loading, setLoading] = useState(true);
//   // const [tattooStyle, setTattooStyle] = useState("Traditional");
//   // const [colorPreference, setColorPreference] = useState("Colorful");
//   // const [tattooPlacement, setTattooPlacement] = useState("Back");

//   const [tattooStyle, setTattooStyle] = useState('');
//   const [colorPreference, setColorPreference] = useState('');
//   const [tattooPlacement, setTattooPlacement] = useState('');
//   const [tattooSize, setTattooSize] = useState('');
//   const [customStyles, setCustomStyles] = useState([]);
//   const [customColors, setCustomColors] = useState([]);
//   const [customSizes, setCustomSizes] = useState([]);
// const [customPlacements, setCustomPlacements] = useState([]);
//   const [dailyLimitReached, setDailyLimitReached] = useState(false);
//   const [limitReachedMessage, setLimitReachedMessage] = useState('');
//   const [isLimitReached, setIsLimitReached] = useState(false);
//   const navigate = useNavigate(); // Initialize the navigate function

//   // Function to handle navigation to the main page
//   const handleNavigateHome = () => {
//     navigate('/'); // Navigate to the root path which is typically the main page
//   };

//   const openai = new OpenAI({
//     apiKey: process.env.REACT_APP_OPENAI_API_KEY,
//     dangerouslyAllowBrowser: true,
//   });
//   // Authentication state observer and get user data
//   // App.js

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
//       if (userAuth) {
//         const userRef = doc(firestore, 'users', userAuth.uid);
//         const userDoc = await getDoc(userRef);
//         setIsAdmin(userDoc.exists() && userDoc.data().isAdmin);
//         setUser(userAuth);
//       } else {
//         setUser(null);
//         setIsAdmin(false);
//       }
//       setLoading(false); // Set loading to false once the user is fetched
//     });

//     return unsubscribe; // Cleanup on unmount
//   }, []);

//   // Debugging useEffect
//   // This useEffect will always be called, but the logic inside will only run when isAdmin is true.
//   useEffect(() => {
//     if (isAdmin) {
//       console.log('Current Admin Status:', isAdmin);
//     }
//     // If you need to run some cleanup when isAdmin changes, you can return a cleanup function here.
//   }, [isAdmin]);

//   useEffect(() => {
//     const today = getTodayString();
//     const imageCount = parseInt(localStorage.getItem(today), 150) || 0;
//     setDailyLimitReached(imageCount >= 150);
//   }, []);

//   // Update the tattooDescription when the language changes
//   useEffect(() => {
//     setTattooDescription(defaultDescriptions[language]);
//   }, [language]);

//   const incrementImageCount = () => {
//     const today = getTodayString();
//     const imageCount = parseInt(localStorage.getItem(today), 150) || 0;
//     localStorage.setItem(today, imageCount + 1);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (dailyLimitReached) {
//       setErrorMessage('Daily limit of 5 images reached. Please try again tomorrow.');
//       setError(true);
//       setSnackbarOpen(true);
//       return;
//     }

//     setIsLoading(true);

//     const combinedPrompt = inputPrompt;

//     try {
//       const response = await openai.images.generate({
//         model: "dall-e-3",
//         prompt: combinedPrompt,
//         n: 1,
//         size: "1024x1024",
//       });
//       console.log("Response from OpenAI:", response);
//       setRevisedPrompt(response.data[0].revised_prompt);
//       setImageURL(response.data[0].url);

//       incrementImageCount();
//       const today = getTodayString();
//       const imageCount = parseInt(localStorage.getItem(today), 150) || 0;
//       if (imageCount >= 150) {
//         setDailyLimitReached(true);
//       }
//     } catch (error) {
//       console.error("Error generating the image:", error);
//       let errorMessage = 'An unexpected error occurred with the API. Please try again later';
//       if (error instanceof Error) {
//         errorMessage += ` ${error.message}`;
//       }
//       setErrorMessage(errorMessage);
//       setSnackbarOpen(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setInputPrompt("");
//     setImageURL("");
//     setIsLoading(false);
//     setSnackbarOpen(false);
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbarOpen(false);
//   };

//   const handleSubmitTattoo = async (event) => {
//     event.preventDefault();
//     setIsLoading(true);

//     if (dailyLimitReached) {
//       setErrorMessage('Daily limit of 5 images reached. Please try again tomorrow.');
//       setError(true);
//       setSnackbarOpen(true);
//       return;
//     }

//     setIsLoading(true);
//     const combinedPrompt = prompts[language].combinedPrompt(tattooDescription, tattooStyle, colorPreference, tattooPlacement, tattooSize);

//     try {
//       // Check if the user has reached the daily limit
//       await checkUserImageLimit();
//       const response = await openai.images.generate({
//         model: "dall-e-3",
//         prompt: combinedPrompt,
//         n: 1,
//         size: "1024x1024",
//       });
//       console.log("Response from OpenAI:", response);
//       setRevisedPrompt(response.data[0].revised_prompt);
//       setImageURL(response.data[0].url);

//       // Increment the user's image count
//       await incrementUserImageCount();

//       incrementImageCount();
//       const today = getTodayString();
//       const imageCount = parseInt(localStorage.getItem(today), 150) || 0;
//       if (imageCount >= 150) {
//         setDailyLimitReached(true);
//       }
//     } catch (error) {
//       console.error("Error generating the image:", error);
//       let errorMessage = 'An unexpected error occurred with the API. Please try again later';
//       if (error instanceof Error) {
//         errorMessage += ` ${error.message}`;
//       }
//       setErrorMessage(errorMessage);
//       setSnackbarOpen(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   // const incrementUserImageCount = async () => {
//   //   const today = getTodayString();
//   //   const userRef = doc(firestore, 'users', user.uid); // Reference to user's document
//   //   const userDoc = await getDoc(userRef);

//   //   if (!userDoc.exists()) {
//   //     await setDoc(userRef, { imageCount: 1, lastGenerated: today }); // Create a new user doc if not exist
//   //   } else {
//   //     // If the date has changed, reset the count
//   //     if (userDoc.data().lastGenerated !== today) {
//   //       await updateDoc(userRef, { imageCount: increment(1) });
//   //     } else {
//   //       await updateDoc(userRef, { imageCount: increment(1) }); // Increment the count
//   //     }
//   //   }
//   // };

//   // const checkUserImageLimit = async () => {
//   //   const today = getTodayString();
//   //   const userRef = doc(firestore, 'users', user.uid);
//   //   const userDoc = await getDoc(userRef);
//   //   const userData = userDoc.data();

//   //   // Check if the user has reached the daily limit
//   //   if (userData && userData.lastGenerated === today && userData.imageCount >= 5) {
//   //     setLimitReachedMessage('You have reached your daily limit of images. Please try again tomorrow.');
//   //     setIsLimitReached(true);
//   //     throw new Error('Daily limit of images reached.');
//   //   }
//   // };
//   const planLimits = {
//     trial: 5,
//     basic: 10,
//     premium: 50
//   };

//   const incrementUserImageCount = async () => {
//     const today = getTodayString();
//     const userRef = doc(firestore, 'users', user.uid);
//     const userDoc = await getDoc(userRef);

//     if (userDoc.exists()) {
//       const userData = userDoc.data();
//       const { lastGenerated, imageCount, plan } = userData;

//       // Check if the date has changed or reset the count if the plan has changed
//       if (lastGenerated !== today || imageCount >= planLimits[plan]) {
//         await updateDoc(userRef, { imageCount: 1, lastGenerated: today });
//       } else {
//         await updateDoc(userRef, { imageCount: increment(1) }); // Increment the count
//       }
//     } else {
//       // Handle cases where the user document doesn't exist
//     }
//   };

//   const checkUserImageLimit = async () => {
//     const today = getTodayString();
//     const userRef = doc(firestore, 'users', user.uid);
//     const userDoc = await getDoc(userRef);
//     const userData = userDoc.data() || {};

//     const { plan = 'trial', imageCount = 0, lastGenerated } = userData;
//     const limit = planLimits[plan];

//     // Check if the user has reached the daily limit for their plan
//     if (lastGenerated === today && imageCount >= limit) {
//       setLimitReachedMessage(`You have reached your daily limit of ${limit} images. Please try again tomorrow or upgrade your plan.`);
//       setIsLimitReached(true);
//       throw new Error('Daily limit of images reached for your plan.');
//     }
//   };

//   // Function to handle creation of new options and update state
//   const handleCreateOption = (inputValue, optionType) => {
//     const newOption = { label: inputValue, value: inputValue.toLowerCase() };
//     if (optionType === 'description') {
//       setCustomDescriptions(prevDescriptions => [...prevDescriptions, newOption]);
//     } else if (optionType === 'style') {
//       setCustomStyles(prevStyles => [...prevStyles, newOption]);
//     } else if (optionType === 'color') {
//       setCustomColors(prevColors => [...prevColors, newOption]);
//     } else if (optionType === 'placement') {
//       setCustomPlacements(prevPlacements => [...prevPlacements, newOption]);
//     } else if (optionType === 'size') {
//       setCustomSizes(prevSizes => [...prevSizes, newOption]);
//     }
//   };

//   // Add this function within your App.js component
//   // const handleSignOut = async () => {
//   //   try {
//   //     await auth.signOut();
//   //     setUser(null); // Reset the user state to null
//   //   } catch (error) {
//   //     console.error('SignOut error:', error);
//   //   }
//   // };

//   const handleAdminNavigation = () => {
//     setIsOnAdminPage(true);
//     navigate('/admin');
//   };
//   // Sign out function
//   const handleSignOut = async () => {
//     try {
//       await auth.signOut(); // Firebase sign out
//       setUser(null); // Reset the user state to null
//       navigate('/'); // Navigate back to the home page
//     } catch (error) {
//       console.error('SignOut error:', error);
//       // Optionally set an error message in state and display it to the user
//     }
//   };
//   // console.log("User:", user);
//   // console.log("Is Admin:", isAdmin);
//   const routes = useRoutes([
//     { path: "/", element: <MainPage /> },
//     { path: "/admin", element: <AdminPage /> },
//     // ... other routes ...
//   ]);

//   if (!user) {
//     return <SignIn onSignIn={() => console.log("User has signed in.")} />;
//   }
// // Custom styles for the CreatableSelect component
// const selectStyles = {
//   control: (styles) => ({
//     ...styles,
//     backgroundColor: 'white',
//     color: 'white',
//   }),
//   option: (styles, { isFocused, isSelected }) => ({
//     ...styles,
//     backgroundColor: isSelected ? 'lightgray' : isFocused ? 'gray' : 'var(--text-color)',
//     color: 'black',
//   }),
// };
//   //show admin page if user is admin
//   return (
//     <div className="App">
//       <AppBar position="fixed" className="AppBar">
//         <Toolbar>
//           {/* Logo and Title */}
//           <div onClick={handleNavigateHome} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
//             {/* <img src="/logo512.png" alt="Logo" className="App-logo" /> */}
//             <Typography variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
//               AI Tattoo Generator
//             </Typography>
//           </div>

//           {/* Language Toggle */}
//           <div style={{ marginLeft: 'auto' }}>
//             <IconButton color="inherit" onClick={toggleLanguage}>
//               <img src={prompts[language].flagIcon} alt={language} style={{ width: 24, height: 24 }} />
//             </IconButton>
//           </div>

//           {/* Admin Dashboard Button */}
//           {isAdmin && (
//             <Link to="/admin" style={{ textDecoration: 'none', color: 'white', marginLeft: 'auto' }}>
//               <Button color="inherit">Admin</Button>
//             </Link>
//           )}

//           {/* Sign out button */}
//           {user && (
//             <Button color="inherit" onClick={handleSignOut} className="sign-out-button">
//               Sign Out
//             </Button>
//           )}

//         </Toolbar>
//       </AppBar>

//       {/* Main Content */}
//       <Routes>
//         <Route path="/" element={!isAdmin ? <MainPage /> : null} />
//         <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/" />} />
//       </Routes>

//       {!isAdmin &&
//         <div className="container">
//           <form onSubmit={handleSubmitTattoo} className="tattoo-form">
//             {/* Form Content */}
//             <h2>{prompts[language].describeTattoo}</h2>

//             {/* Corrected TextField for tattoo description */}
//             <TextField
//   fullWidth
//   placeholder={prompts[language].describeTattoo}
//   value={tattooDescription}
//   onChange={(e) => setTattooDescription(e.target.value)}
//   InputProps={{
//     style: {
//       backgroundColor: 'white',
//       color: 'black',
//       borderColor: 'rgba(0,0,0,0.23)',
//     },
//   }}
//   variant="outlined"
//   margin="normal"
//   // ... other props
// />

//             {/* <CreatableSelect
//               isClearable
//               onChange={(newValue) => setTattooDescription(newValue ? newValue.value : '')}
//               onCreateOption={(inputValue) => handleCreateOption(inputValue, 'description')}
//               options={[...defaultDescriptions[language].map((value) => ({ value, label: value })), ...customDescriptions]}
//             /> */}

//             {/* ... [CreatableSelect for Tattoo Style] */}
//             <div className="select-wrapper">
//               <label>{prompts[language].pickStyle}</label>
//               <CreatableSelect
//                 isClearable
//                 styles={selectStyles}
//                 onChange={(newValue) => setTattooStyle(newValue ? newValue.value : '')}
//                 onCreateOption={(inputValue) => handleCreateOption(inputValue, 'style')}
//                 options={[...Object.entries(prompts[language].styles).map(([value, label]) => ({ value, label })), ...customStyles]}
//               />
//             </div>

//             {/* Creatable Select for Color Preference */}
//             <div className="select-wrapper">
//               <label>{prompts[language].colorPreference}</label>
//               <CreatableSelect
//                 isClearable
//                 styles={selectStyles}
//                 onChange={(newValue) => setColorPreference(newValue ? newValue.value : '')}
//                 onCreateOption={(inputValue) => handleCreateOption(inputValue, 'color')}
//                 options={[...Object.entries(prompts[language].colors).map(([value, label]) => ({ value, label })), ...customColors]}
//               />
//             </div>

//             {/* Creatable Select for Tattoo Placement */}
//             <div className="select-wrapper">
//               <label>{language === 'en' ? 'Pick a placement...' : 'Chọn vị trí...'}</label>
//               <CreatableSelect
//                 isClearable
//                 styles={selectStyles}
//                 onChange={(newValue) => setTattooPlacement(newValue ? newValue.value : '')}
//                 onCreateOption={(inputValue) => handleCreateOption(inputValue, 'placement')}
//                 options={[...Object.entries(prompts[language].placements).map(([value, label]) => ({ value, label })), ...customPlacements]}
//               />
//             </div>

//             {/* Creatable Select for Tattoo Size */}
// <div className="select-wrapper">
//   <label>{language === 'en' ? 'Pick a size...' : 'Chọn kích thước...'}</label>
//   <CreatableSelect
//     isClearable
//     styles={selectStyles}
//     onChange={(newValue) => setTattooSize(newValue ? newValue : '')} // Changed to set the selected value directly
//     onCreateOption={(inputValue) => handleCreateOption(inputValue, 'size')}
//     options={[...Object.entries(prompts[language].size).map(([value, label]) => ({ value, label })), ...customSizes]} // Changed to customSizes for clarity
//     formatCreateLabel={(inputValue) => `Create "${inputValue}"`} // Optional: Makes it clear a new size is being created
//   />
// </div>

//               {/* Creatable Select for Tattoo Size */}
// {/* <div className="select-wrapper">
//   <label>{language === 'en' ? 'Pick a size...' : 'Chọn kích thước...'}</label>
//   <CreatableSelect
//     isClearable
//     styles={selectStyles}
//     onChange={(newValue) => setTattooSize(newValue ? newValue : '')}
//     onCreateOption={(inputValue) => handleCreateOption(inputValue, 'size')}
//     options={[
//       { value: '1cm', label: 'Small' },
//       { value: '1.5cm', label: 'Medium' },
//       { value: '2cm', label: 'Large' },
//       ...customSizes // Ensure any custom sizes are also included
//     ]}
//     formatCreateLabel={(inputValue) => `Create "${inputValue}"`} // Optional: Makes it clear a new size is being created
//   />
// </div> */}

//               {/* Generate Button */}
//             <Button
//               variant="contained"
//               color="primary"
//               type="submit"
//               className="generate-button"
//               disabled={isLoading}
//               startIcon={isLoading ? <CircularProgress size={24} color="secondary" /> : null}
//             >
//               {isLoading ? 'Generating...' : prompts[language].generateTattoo}
//             </Button>

//           </form>

//           {/* Image Display */}
//           {imageURL && (
//             <div className="image-display">
//               <img src={imageURL} alt="Generated Art" className="generated-image" />
//             </div>
//           )}

//           {/* Limit Reached Notification */}
//           <Snackbar
//             className="snackbar-limit-reached"
//             open={isLimitReached}
//             autoHideDuration={6000}
//             onClose={() => setIsLimitReached(false)}
//             message={limitReachedMessage}
//             action={
//               <Button color="secondary" size="small" onClick={() => setIsLimitReached(false)}>
//                 CLOSE
//               </Button>
//             }
//           />
//         </div>
//       }

//       {/* Bottom Navigation */}
//       <BottomNavigation showLabels className="BottomNavigation" style={{ backgroundColor: '#1976D2', color: 'white' }}>

//   {/* Copyright Information */}
//   <div style={{ flexGrow: 1, textAlign: 'center', padding: '15px', color: 'white' }}>
//     © {new Date().getFullYear()} AI Tattoo Generator. All rights reserved.
//   </div>

//   {/* <BottomNavigationAction label="LinkedIn" icon={<LinkedInIcon />} />
//   <BottomNavigationAction label="GitHub" icon={<GitHubIcon />} /> */}
// </BottomNavigation>
//       <Analytics />
//     </div>
//   );
// }

// export default App;

//   return (
//     <div className="App">
//       <AppBar position="fixed" className="AppBar">
//         <Toolbar>
//       {/* Wrap the logo and title with a click handler */}
//       <div onClick={handleNavigateHome} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
//         <img src="/logo512.png" alt="Logo" className="App-logo" />
//         <Typography variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
//           AI Tattoo Generator
//         </Typography>
//       </div>
//       {/* Flex container to push the language button and sign out button to the right */}
//       <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
//           <IconButton color="inherit" onClick={toggleLanguage}>
//             <img src={prompts[language].flagIcon} alt={language} style={{ width: 24, height: 24 }} />
//           </IconButton>
//           {/* Admin Dashboard Button */}
//           {isAdmin && (
//             <Button color="inherit" onClick={handleAdminNavigation} className="admin-button">
//               Admin
//             </Button>
//           )}

//           {/* Sign out button */}
//           {user && (
//             <Button color="inherit" onClick={handleSignOut} className="sign-out-button">
//               Sign Out
//             </Button>
//           )}
//         </div>
//     </Toolbar>
//       </AppBar >
//     <div className="container">
//       {/* Modify your form to include CreatableSelect and suggestions */}
//       <form onSubmit={handleSubmitTattoo} className="tattoo-form">
//         <h2>{prompts[language].describeTattoo}</h2>

//         {/* Corrected TextField for tattoo description */}
//         <TextField
//           fullWidth
//           label={prompts[language].describeTattoo}
//           value={tattooDescription}
//           onChange={(e) => setTattooDescription(e.target.value)}
//         />
//         {/* <CreatableSelect
//             isClearable
//             onChange={(newValue) => setTattooDescription(newValue ? newValue.value : '')}
//             onCreateOption={(inputValue) => handleCreateOption(inputValue, 'description')}
//             options={[...defaultDescriptions[language].map((value) => ({ value, label: value })), ...customDescriptions]}
//           /> */}

//         {/* ... [CreatableSelect for Tattoo Style] */}
//         <div className="select-wrapper">
//           <label>{prompts[language].pickStyle}</label>
//           <CreatableSelect
//             isClearable
//             onChange={(newValue) => setTattooStyle(newValue ? newValue.value : '')}
//             onCreateOption={(inputValue) => handleCreateOption(inputValue, 'style')}
//             options={[...Object.entries(prompts[language].styles).map(([value, label]) => ({ value, label })), ...customStyles]}
//           />
//         </div>

//         {/* Creatable Select for Color Preference */}
//         <div className="select-wrapper">
//           <label>{prompts[language].colorPreference}</label>
//           <CreatableSelect
//             isClearable
//             onChange={(newValue) => setColorPreference(newValue ? newValue.value : '')}
//             onCreateOption={(inputValue) => handleCreateOption(inputValue, 'color')}
//             options={[...Object.entries(prompts[language].colors).map(([value, label]) => ({ value, label })), ...customColors]}
//           />
//         </div>

//         {/* Creatable Select for Tattoo Placement */}
//         <div className="select-wrapper">
//           <label>{language === 'en' ? 'Pick a placement...' : 'Chọn vị trí...'}</label>
//           <CreatableSelect
//             isClearable
//             onChange={(newValue) => setTattooPlacement(newValue ? newValue.value : '')}
//             onCreateOption={(inputValue) => handleCreateOption(inputValue, 'placement')}
//             options={[...Object.entries(prompts[language].placements).map(([value, label]) => ({ value, label })), ...customPlacements]}
//           />
//         </div>
//         <Button
//           variant="contained"
//           color="primary"
//           type="submit"
//           className="generate-button"
//           disabled={isLoading}
//           startIcon={isLoading ? <CircularProgress size={24} color="secondary" /> : null}
//         >
//           {isLoading ? 'Generating...' : prompts[language].generateTattoo}
//         </Button>
//       </form>

//       {/* Image Display */}
//       {imageURL && (
//         <div className="image-display">
//           <img src={imageURL} alt="Generated Art" className="generated-image" />
//         </div>
//       )}

//       {/* Snackbar for Error Messages */}
//       <Snackbar
//         className="snackbar-limit-reached"
//         open={isLimitReached}
//         autoHideDuration={6000}
//         onClose={() => setIsLimitReached(false)}
//         message={limitReachedMessage}
//         action={
//           <Button color="secondary" size="small" onClick={() => setIsLimitReached(false)}>
//             CLOSE
//           </Button>
//         }
//       />
//     </div>
//   {/* Setup routes */ }
//   <Routes>
//     <Route path="/" element={<MainPage />} />
//     <Route path="/admin" element={<AdminPage />} />
//     {/* Other routes */}
//   </Routes>

//   {/* Bottom navigation */ }
//       <BottomNavigation showLabels className="BottomNavigation">
//         <BottomNavigationAction
//           label="LinkedIn"
//           icon={<LinkedInIcon />}
//           onClick={() => window.open('https://www.linkedin.com/in/danducvu', '_blank')}
//         />
//         <BottomNavigationAction
//           label="GitHub"
//           icon={<GitHubIcon />}
//           onClick={() => window.open('https://github.com/danvufs', '_blank')}
//         />
//       </BottomNavigation>
//       <Analytics />
//     </div >
//   );
// };

// export default App;

//English only version
//App.js

// import React, { useState, useEffect } from 'react';
// import { OpenAI } from 'openai';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import CircularProgress from '@mui/material/CircularProgress';
// import Snackbar from '@mui/material/Snackbar';
// import AppBar from '@mui/material/AppBar';
// import Toolbar from '@mui/material/Toolbar';
// import Typography from '@mui/material/Typography';
// import BottomNavigation from '@mui/material/BottomNavigation';
// import BottomNavigationAction from '@mui/material/BottomNavigationAction';
// import LinkedInIcon from '@mui/icons-material/LinkedIn';
// import GitHubIcon from '@mui/icons-material/GitHub';
// import { Analytics } from '@vercel/analytics/react';
// import './App.css';

// // Helper function to get today's date as a string
// const getTodayString = () => {
//   const today = new Date();
//   return today.toISOString().split('T')[0];
// };

// function App() {
//   const [inputPrompt, setInputPrompt] = useState("");
//   const [imageURL, setImageURL] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [error, setError] = useState(false);
//   const [revisedPrompt, setRevisedPrompt] = useState("");

//   // New states for tattoo generator
//   const [tattooDescription, setTattooDescription] = useState("A snake with a skull and roses");
//   const [tattooStyle, setTattooStyle] = useState("Traditional");
//   const [colorPreference, setColorPreference] = useState("Colorful");
//   const [tattooPlacement, setTattooPlacement] = useState("Back");

//   const [dailyLimitReached, setDailyLimitReached] = useState(false);

//   const openai = new OpenAI({
//     apiKey: process.env.REACT_APP_OPENAI_API_KEY,
//     dangerouslyAllowBrowser: true,
//   });

//   useEffect(() => {
//     const today = getTodayString();
//     const imageCount = parseInt(localStorage.getItem(today), 10) || 0;
//     setDailyLimitReached(imageCount >= 150);
//   }, []);

//   const incrementImageCount = () => {
//     const today = getTodayString();
//     const imageCount = parseInt(localStorage.getItem(today), 10) || 0;
//     localStorage.setItem(today, imageCount + 1);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (dailyLimitReached) {
//       setErrorMessage('Daily limit of 5 images reached. Please try again tomorrow.');
//       setError(true);
//       setSnackbarOpen(true);
//       return;
//     }

//     setIsLoading(true);

//     const combinedPrompt = inputPrompt;

//     try {
//       const response = await openai.images.generate({
//         model: "dall-e-3",
//         prompt: combinedPrompt,
//         n: 1,
//         size: "1024x1024",
//       });
//       console.log("Response from OpenAI:", response);
//       setRevisedPrompt(response.data[0].revised_prompt);
//       setImageURL(response.data[0].url);

//       incrementImageCount();
//       const today = getTodayString();
//       const imageCount = parseInt(localStorage.getItem(today), 10) || 0;
//       if (imageCount >= 150) {
//         setDailyLimitReached(true);
//       }
//     } catch (error) {
//       console.error("Error generating the image:", error);
//       let errorMessage = 'An unexpected error occurred with the API. Please try again later';
//       if (error instanceof Error) {
//         errorMessage += ` ${error.message}`;
//       }
//       setErrorMessage(errorMessage);
//       setSnackbarOpen(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setInputPrompt("");
//     setImageURL("");
//     setIsLoading(false);
//     setSnackbarOpen(false);
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbarOpen(false);
//   };

//   const handleSubmitTattoo = async (event) => {
//     event.preventDefault();

//     if (dailyLimitReached) {
//       setErrorMessage('Daily limit of 5 images reached. Please try again tomorrow.');
//       setError(true);
//       setSnackbarOpen(true);
//       return;
//     }

//     setIsLoading(true);
//     const combinedPrompt = `Create a visually stunning and intricately detailed tattoo design suitable for the ${tattooPlacement}. Theme: ${tattooDescription}, rich with elaborate details and artistic elements. Style: ${tattooStyle}, exuding a blend of sophistication and creativity. Color Scheme: ${colorPreference}, employing a harmonious and vibrant palette. The design should be carefully composed to fit the specific placement, ensuring no crucial elements are cut off at the edges. It should evoke a sense of awe and be a masterpiece in craftsmanship, perfectly embodying the essence of the described theme and the distinctiveness of the chosen style.`;

//     try {
//       const response = await openai.images.generate({
//         model: "dall-e-3",
//         prompt: combinedPrompt,
//         n: 1,
//         size: "1024x1024",
//       });
//       console.log("Response from OpenAI:", response);
//       setRevisedPrompt(response.data[0].revised_prompt);
//       setImageURL(response.data[0].url);

//       incrementImageCount();
//       const today = getTodayString();
//       const imageCount = parseInt(localStorage.getItem(today), 10) || 0;
//       if (imageCount >= 150) {
//         setDailyLimitReached(true);
//       }
//     } catch (error) {
//       console.error("Error generating the image:", error);
//       let errorMessage = 'An unexpected error occurred with the API. Please try again later';
//       if (error instanceof Error) {
//         errorMessage += ` ${error.message}`;
//       }
//       setErrorMessage(errorMessage);
//       setSnackbarOpen(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="App">
//       <AppBar position="fixed" className="AppBar">
//         <Toolbar>
//           <img src="/logo512.png" alt="Logo" className="App-logo" />
//           <Typography variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
//             AI Tattoo Generator
//           </Typography>
//         </Toolbar>
//       </AppBar>
//       <div className="container">
//         {/* Existing tabs and form for DALL·E 3 Art Generator... */}

//         {/* New Form for Tattoo Generator */}
//         <form onSubmit={handleSubmitTattoo} className="tattoo-form">
//           <h2>Tattoo Idea Generator</h2>
//           <TextField
//             fullWidth
//             label="Describe your tattoo idea"
//             value={tattooDescription}
//             onChange={(e) => setTattooDescription(e.target.value)}
//           />
//           {/* New Select for Tattoo Placement */}
//         <div className="select-wrapper">
//           <label>Pick a placement...</label>
//           <select
//             value={tattooPlacement}
//             onChange={(e) => setTattooPlacement(e.target.value)}
//             className="option-select"
//           >
//             <option value="Back">Back</option>
//             <option value="Arm">Arm</option>
//             <option value="Hand">Hand</option>
//             <option value="Leg">Leg</option>
//             <option value="Chest">Chest</option>
//             <option value="Neck">Neck</option>
//             <option value="Other">Other</option>
//           </select>
//         </div>
//           <div className="select-wrapper">
//             <label>Pick a style...</label>
//             <select
//               value={tattooStyle}
//               onChange={(e) => setTattooStyle(e.target.value)}
//               className="option-select"
//             >
//               <option value="traditional" selected>Traditional</option>
//                 <option value="realism">Realism</option>
//                 <option value="neo-traditional">Neo-Traditional</option>
//                 <option value="watercolor">Watercolor</option>
//                 <option value="tribal">Tribal</option>
//                 <option value="geometric">Geometric</option>
//                 <option value="dotwork">Dotwork</option>
//                 <option value="new-school">New School</option>
//                 <option value="fine-line">Fine Line</option>
//                 <option value="japanese">Japanese</option>
//                 <option value="blackwork">Blackwork</option>
//                 <option value="lettering">Lettering</option>
//                 <option value="trash-polka">Trash Polka</option>
//                 <option value="biomechanical">Biomechanical</option>
//                 <option value="illustrative">Illustrative</option>
//                 <option value="abstract">Abstract</option>
//                 <option value="surrealism">Surrealism</option>
//                 <option value="sketch">Sketch</option>

//             </select>
//           </div>
//           <div className="select-wrapper">
//             <label>Color Preference</label>
//             <select
//               value={colorPreference}
//               onChange={(e) => setColorPreference(e.target.value)}
//               className="option-select"
//             >
//               <option value="Colorful">Colorful</option>
//               <option value="Black and Grey">Black and Grey</option>
//               <option value="Black">Black</option>
//             </select>
//           </div>
//           <Button
//             variant="contained"
//             color="primary"
//             type="submit"
//             className="generate-button"
//             disabled={isLoading}
//             startIcon={isLoading ? <CircularProgress size={24} color="secondary" /> : null} // Show loading indicator as the startIcon when loading
//           >
//             {isLoading ? 'Generating...' : 'Generate Tattoo'}
//           </Button>
//         </form>

//         {/* Image Display */}
//         {imageURL && (
//         <div className="image-display">
//           <img src={imageURL} alt="Generated Art" className="generated-image" />
//         </div>
//         )}

//         {/* Snackbar for Error Messages */}
//         <Snackbar
//           open={snackbarOpen}
//           autoHideDuration={6000}
//           onClose={handleCloseSnackbar}
//           message={errorMessage}
//           action={
//             <Button color="secondary" size="small" onClick={handleCloseSnackbar}>
//               CLOSE
//             </Button>
//           }
//         />
//       </div>
//       <BottomNavigation showLabels className="BottomNavigation">
//         <BottomNavigationAction
//           label="LinkedIn"
//           icon={<LinkedInIcon />}
//           onClick={() => window.open('https://www.linkedin.com/in/danducvu', '_blank')}
//         />
//         <BottomNavigationAction
//           label="GitHub"
//           icon={<GitHubIcon />}
//           onClick={() => window.open('https://github.com/danvufs', '_blank')}
//         />
//       </BottomNavigation>
//       <Analytics />
//     </div>
//   );
// }

// export default App;
