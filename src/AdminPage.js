// // src/AdminPage.js
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { app } from './firebase';
import './AdminPage.css'; // Import your custom styles here

// Define plan limits
const planLimits = {
    trial: 5,
    basic: 10,
    premium: 50
  };

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const firestore = getFirestore(app);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updatePlan = async (userId, newPlan) => {
    try {
      const userRef = doc(firestore, 'users', userId);
      const newLimit = planLimits[newPlan];
      await updateDoc(userRef, { plan: newPlan, imageLimit: newLimit });
      fetchUsers(); // Refresh the users list to reflect the change
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  const resetImageCount = async (userId) => {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, { imageCount: 0 });
      fetchUsers();
    } catch (error) {
      console.error("Error resetting image count:", error);
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>No.</th> {/* Added column for numbering */}
            <th>Email</th>
            <th>Image Count</th>
            <th>Plan</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => ( // Use index for numbering
            <tr key={user.id}>
              <td>{index + 1}</td> {/* Display row number */}
              <td>{user.email}</td>
              <td>{user.imageCount}</td>
              <td>{user.plan || 'Not set'}</td>
              <td>
                <button onClick={() => updatePlan(user.id, 'premium')}>Premium</button>
                <button onClick={() => updatePlan(user.id, 'basic')}>Basic</button>
                <button onClick={() => resetImageCount(user.id)}>Reset</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;



// import React, { useState, useEffect } from 'react';
// import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
// import { app } from './firebase';

// const AdminPage = () => {
//   const [users, setUsers] = useState([]);
//   const firestore = getFirestore(app);

//   // Declare fetchUsers outside of useEffect so it can be called from other functions
//   const fetchUsers = async () => {
//     try {
//       const usersCollection = collection(firestore, 'users');
//       const usersSnapshot = await getDocs(usersCollection);
//       const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setUsers(usersList);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       // Optionally handle the error by setting some state to show an error message
//     }
//   };

//   // Call fetchUsers when the component mounts
//   useEffect(() => {
//     fetchUsers();
//   }, []); // Dependencies array is empty, so this runs once on mount

//   const resetImageCount = async (userId) => {
//     try {
//       const userRef = doc(firestore, 'users', userId);
//       await updateDoc(userRef, { imageCount: 0 });
//       fetchUsers(); // Refresh the user list
//     } catch (error) {
//       console.error("Error resetting image count:", error);
//       // Handle the error appropriately
//     }
//   };

//   const setImageLimit = async (userId, limit) => {
//     try {
//       const userRef = doc(firestore, 'users', userId);
//       await updateDoc(userRef, { imageLimit: limit });
//       fetchUsers(); // Refresh the user list
//     } catch (error) {
//       console.error("Error setting image limit:", error);
//       // Handle the error appropriately
//     }
//   };

//   // Render the admin dashboard UI
//   return (
//     <div>
//       <h1>Admin Dashboard Test</h1>
//       {users.map((user) => (
//         <div key={user.id}>
//           <p>Email: {user.email}</p>
//           <p>Image Count: {user.imageCount}</p>
//           <button onClick={() => resetImageCount(user.id)}>Reset Image Count</button>
//           <button onClick={() => setImageLimit(user.id, 10)}>Set Image Limit</button>
//           {/* More UI elements and functionality as needed */}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default AdminPage;
