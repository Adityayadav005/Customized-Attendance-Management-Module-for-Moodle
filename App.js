// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./App.css";

// function App() {
//   const [attendance, setAttendance] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [userCourses, setUserCourses] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [mergedData, setMergedData] = useState([]);
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAttendance = axios.get("http://localhost:5001/guru_attendance");
//     const fetchSessions = axios.get("http://localhost:5001/guru_attendance_sessions");
//     const fetchUserCourses = axios.get("http://localhost:5001/guru_user");
//     const fetchCourses = axios.get("http://localhost:5001/guru_course");
//     const fetchCategories = axios.get("http://localhost:5001/guru_course_categories"); // Fetch categories

//     Promise.allSettled([fetchAttendance, fetchSessions, fetchUserCourses, fetchCourses, fetchCategories])
//       .then((results) => {
//         const [attendanceRes, sessionsRes, userCoursesRes, coursesRes, categoriesRes] = results;

//         let attendanceData = [];
//         let sessionData = [];
//         let userCoursesData = [];
//         let coursesData = [];
//         let categoriesData = [];

//         if (attendanceRes.status === "fulfilled") {
//           attendanceData = attendanceRes.value.data;
//           setAttendance(attendanceData);
//         } else {
//           console.error("Attendance API failed:", attendanceRes.reason);
//         }

//         if (sessionsRes.status === "fulfilled") {
//           sessionData = sessionsRes.value.data;
//           setSessions(sessionData);
//         } else {
//           console.error("Sessions API failed:", sessionsRes.reason);
//         }

//         if (userCoursesRes.status === "fulfilled") {
//           userCoursesData = userCoursesRes.value.data;
//           setUserCourses(userCoursesData);
//         } else {
//           console.error("User Courses API failed:", userCoursesRes.reason);
//         }

//         if (coursesRes.status === "fulfilled") {
//           coursesData = coursesRes.value.data;
//         } else {
//           console.error("Courses API failed:", coursesRes.reason);
//         }

//         if (categoriesRes.status === "fulfilled") {
//           categoriesData = categoriesRes.value.data;
//         } else {
//           console.error("Categories API failed:", categoriesRes.reason);
//         }

//         // Map category IDs to department and course categories
//         const departmentMap = {};
//         const categoryMap = {};
//         categoriesData.forEach((category) => {
//           if (category.parent === 0) {
//             departmentMap[category.id] = category.name; // Map departments
//           } else {
//             categoryMap[category.id] = {
//               name: category.name,
//               department: departmentMap[category.parent] || "Unknown",
//             }; // Map categories and associate with departments
//           }
//         });


//         // Get today's date without time
//         const today = new Date();
//         const todayString = today.toLocaleDateString("en-US"); // Format: MM/DD/YYYY

//         // Merge data
//         const combined = attendanceData.map((att) => {
//           const session = sessionData.find((sess) => sess.attendanceid === att.id);
//           const userCourse = userCoursesData.find((uc) => uc.id === att.userid);
//           const takenByUser = session?.lasttakenby
//             ? userCoursesData.find((uc) => uc.id === session.lasttakenby)
//             : null;
//           const course = coursesData.find((c) => c.id === att.course);
//           const courseCategory = categoryMap[course?.category] || { name: "Unknown", department: "Unknown" };

//           const attendanceStatus = session?.sessdate && session?.lasttaken * 1000 >= session?.sessdate * 1000
//             ? "Marked"
//             : "Not Marked";

//           // Convert session date to a string and compare with today's date
//           const sessionDateString = session?.sessdate
//             ? new Date(session.sessdate * 1000).toLocaleDateString("en-US")
//             : "";

//           // Only include records where the session date is today
//           //  if (sessionDateString === todayString) {
//             return {
//               id: session?.id,
//               userid: att.userid,
//               grade: att.grade,
//               lasttaken: session?.lasttaken,
//               firstname: userCourse?.firstname || "N/A",
//               lastname: userCourse?.lastname || "N/A",
//               lasttakenby: takenByUser
//                 ? `${takenByUser.firstname} ${takenByUser.lastname}`
//                 : "N/A",
//               course_name: course?.fullname || "N/A",
//               readableSessDate: session?.sessdate
//                 ? new Date(session.sessdate * 1000).toLocaleString()
//                 : "N/A",
//               readableDuration: session?.duration
//                 ? formatDuration(session.duration)
//                 : "N/A",
//               attendanceStatus,
//               department: courseCategory.department,
//               courseCategory: courseCategory.name,
//             };
//           //  }
//           //  return null; // Exclude sessions that are not today
//         });
//         //  .filter(Boolean); // Remove any null values from the array;

//         setMergedData(combined);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//         setLoading(false);
//       });
//   }, []);


//   // Utility function to format duration
//   function formatDuration(seconds) {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const readableDuration = [];

//     if (hours > 0) readableDuration.push(`${hours} hour${hours > 1 ? "s" : ""}`);
//     if (minutes > 0)
//       readableDuration.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

//     return readableDuration.join(" ") || "0 minutes";
//   }

//   // Sort handler
//   const handleSort = (key) => {
//     let direction = "ascending";
//     if (sortConfig.key === key && sortConfig.direction === "ascending") {
//       direction = "descending";
//     }
//     setSortConfig({ key, direction });

//     const sortedData = [...mergedData].sort((a, b) => {
//       if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
//       if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
//       return 0;
//     });

//     setMergedData(sortedData);
//   };

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <div>
//       <h1>Attendance Records</h1>
//       <table border="1">
//         <thead>
//           <tr>
//             <th onClick={() => handleSort("id")}>ID</th>
//             <th onClick={() => handleSort("department")}>Department</th>
//             <th onClick={() => handleSort("courseCategory")}>Course Category</th>
//             <th onClick={() => handleSort("course_name")}>Course Name</th>
//             <th onClick={() => handleSort("lasttakenby")}>Teacher Name</th>
//             <th onClick={() => handleSort("readableSessDate")}>Session Timing</th>
//             <th onClick={() => handleSort("readableDuration")}>Duration</th>
//             <th onClick={() => handleSort("lasttaken")}>Last Taken</th>
//             <th onClick={() => handleSort("attendanceStatus")}>Attendance Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {mergedData
//             .filter((record) => record.id)
//             .map((record) => (
//               <tr key={record.id}>
//                 <td>{record.id}</td>
//                 <td>{record.department}</td>
//                 <td>{record.courseCategory}</td>
//                 <td>{record.course_name}</td>
//                 <td>{record.lasttakenby || "N/A"}</td>
//                 <td>{record.readableSessDate}</td>
//                 <td>{record.readableDuration}</td>
//                 <td>{record.lasttaken ? new Date(record.lasttaken * 1000).toLocaleString() : "N/A"}</td>
//                 <td>{record.attendanceStatus}</td>
//               </tr>
//             ))}
//         </tbody>

//       </table>
//     </div>
//   );
// }

// export default App;







// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./App.css";
// import Login from "./login";
// import "./login.css";

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication status
//   const [attendance, setAttendance] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [userCourses, setUserCourses] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [mergedData, setMergedData] = useState([]);
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
//   const [loading, setLoading] = useState(true);
//   const [showTodayOnly, setShowTodayOnly] = useState(false); // State to toggle between today's sessions and all sessions


//   useEffect(() => {
//     if (!isAuthenticated) return; // Prevent data fetching if not authenticated
//     const fetchAttendance = axios.get("http://localhost:5001/guru_attendance");
//     const fetchSessions = axios.get("http://localhost:5001/guru_attendance_sessions");
//     const fetchUserCourses = axios.get("http://localhost:5001/guru_user");
//     const fetchCourses = axios.get("http://localhost:5001/guru_course");
//     const fetchCategories = axios.get("http://localhost:5001/guru_course_categories");

//     Promise.allSettled([fetchAttendance, fetchSessions, fetchUserCourses, fetchCourses, fetchCategories])
//       .then((results) => {
//         const [attendanceRes, sessionsRes, userCoursesRes, coursesRes, categoriesRes] = results;

//         let attendanceData = [];
//         let sessionData = [];
//         let userCoursesData = [];
//         let coursesData = [];
//         let categoriesData = [];

//         if (attendanceRes.status === "fulfilled") {
//           attendanceData = attendanceRes.value.data;
//           setAttendance(attendanceData);
//         } else {
//           console.error("Attendance API failed:", attendanceRes.reason);
//         }

//         if (sessionsRes.status === "fulfilled") {
//           sessionData = sessionsRes.value.data;
//           setSessions(sessionData);
//         } else {
//           console.error("Sessions API failed:", sessionsRes.reason);
//         }

//         if (userCoursesRes.status === "fulfilled") {
//           userCoursesData = userCoursesRes.value.data;
//           setUserCourses(userCoursesData);
//         } else {
//           console.error("User Courses API failed:", userCoursesRes.reason);
//         }

//         if (coursesRes.status === "fulfilled") {
//           coursesData = coursesRes.value.data;
//         } else {
//           console.error("Courses API failed:", coursesRes.reason);
//         }

//         if (categoriesRes.status === "fulfilled") {
//           categoriesData = categoriesRes.value.data;
//         } else {
//           console.error("Categories API failed:", categoriesRes.reason);
//         }

//         // Map category IDs to department and course categories
//         const departmentMap = {};
//         const categoryMap = {};
//         categoriesData.forEach((category) => {
//           if (category.parent === 0) {
//             departmentMap[category.id] = category.name;
//           } else {
//             categoryMap[category.id] = {
//               name: category.name,
//               department: departmentMap[category.parent] || "Unknown",
//             };
//           }
//         });

//         // Merge data
//         const combined = [];

//         attendanceData.forEach((att) => {
//           // Find all sessions related to the attendance ID
//           const sessionsForAttendance = sessionData.filter((sess) => sess.attendanceid === att.id);

//           sessionsForAttendance.forEach((session) => {
//             const userCourse = userCoursesData.find((uc) => uc.id === att.userid);
//             const takenByUser = session?.lasttakenby
//               ? userCoursesData.find((uc) => uc.id === session.lasttakenby)
//               : null;
//             const course = coursesData.find((c) => c.id === att.course);
//             const courseCategory = categoryMap[course?.category] || { name: "Unknown", department: "Unknown" };

//             const extraTimeInMinutes = 10;
//             const extraTimeInSeconds = extraTimeInMinutes * 60;

//             const attendanceStatus = session?.sessdate && session?.duration && session?.lasttaken
//               ? session.lasttaken >= session.sessdate &&
//                 session.lasttaken <= session.sessdate + session.duration + extraTimeInSeconds
//                 ? "Marked"
//                 : "Not Marked"
//               : "Not Marked";

//             combined.push({
//               id: session?.id,
//               userid: att.userid,
//               grade: att.grade,
//               lasttaken: session?.lasttaken,
//               firstname: userCourse?.firstname || "N/A",
//               lastname: userCourse?.lastname || "N/A",
//               lasttakenby: takenByUser
//                 ? `${takenByUser.firstname} ${takenByUser.lastname}`
//                 : "N/A",
//               course_name: course?.fullname || "N/A",
//               readableSessDate: session?.sessdate
//                 ? new Date(session.sessdate * 1000).toLocaleString()
//                 : "N/A",
//               readableDuration: session?.duration
//                 ? formatDuration(session.duration)
//                 : "N/A",
//               attendanceStatus,
//               department: courseCategory.department,
//               courseCategory: courseCategory.name,
//               sessionDate: session?.sessdate,
//             });
//           });
//         });

//         // Filter records for today's sessions
//         const today = new Date();
//         const todayStart = new Date(today.setHours(0, 0, 0, 0)).getTime() / 1000; // Today's start in Unix timestamp
//         const todayEnd = new Date(today.setHours(23, 59, 59, 999)).getTime() / 1000; // Today's end in Unix timestamp

//         const filteredData = showTodayOnly
//           ? combined.filter((record) => record.sessionDate >= todayStart && record.sessionDate <= todayEnd)
//           : combined;

//         setMergedData(filteredData);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//         setLoading(false);
//       });
//   }, [isAuthenticated,showTodayOnly]);
//   // isAuthenticated
//   const handleLoginSuccess = () => {
//     setIsAuthenticated(true); // Update authentication state on successful login
//   };

//   if (!isAuthenticated) {
//     return <Login onLoginSuccess={handleLoginSuccess} />;
//   }

//    // Toggle function to switch between today's sessions and all sessions
//    const toggleSessions = () => {
//     setShowTodayOnly((prevState) => !prevState); // Toggle the state
//   };

//   // Utility function to format duration
//   function formatDuration(seconds) {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const readableDuration = [];

//     if (hours > 0) readableDuration.push(`${hours} hour${hours > 1 ? "s" : ""}`);
//     if (minutes > 0)
//       readableDuration.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

//     return readableDuration.join(" ") || "0 minutes";
//   }

//   // Sort handler
//   const handleSort = (key) => {
//     let direction = "ascending";
//     if (sortConfig.key === key && sortConfig.direction === "ascending") {
//       direction = "descending";
//     }
//     setSortConfig({ key, direction });

//     const sortedData = [...mergedData].sort((a, b) => {
//       const valueA = a[key];
//       const valueB = b[key];

//       // Handle null or undefined values
//       if (valueA == null && valueB != null) return direction === "ascending" ? 1 : -1;
//       if (valueB == null && valueA != null) return direction === "ascending" ? -1 : 1;
//       if (valueA == null && valueB == null) return 0;

//       // Handle sorting based on data types
//       if (typeof valueA === "number" && typeof valueB === "number") {
//         return direction === "ascending" ? valueA - valueB : valueB - valueA;
//       }
//       if (typeof valueA === "string" && typeof valueB === "string") {
//         return direction === "ascending"
//           ? valueA.localeCompare(valueB)
//           : valueB.localeCompare(valueA);
//       }
//       if (valueA instanceof Date && valueB instanceof Date) {
//         return direction === "ascending"
//           ? valueA - valueB
//           : valueB - valueA;
//       }

//       return 0; // Default case for unexpected types
//     });

//     setMergedData(sortedData);
//   };


//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <div>
//       <h1>Attendance Records</h1>
//       {/* Toggle Button */}
//       <button onClick={toggleSessions} className="button">
//         {showTodayOnly ? "Show All Sessions" : "Show Today's Sessions"}
//       </button>


//       <table border="1">
//         <thead>
//           <tr>
//             <th onClick={() => handleSort("id")}>ID</th>
//             <th onClick={() => handleSort("department")}>Department</th>
//             <th onClick={() => handleSort("courseCategory")}>Course Category</th>
//             <th onClick={() => handleSort("course_name")}>Course Name</th>
//             <th onClick={() => handleSort("lasttakenby")}>Teacher Name</th>
//             <th onClick={() => handleSort("readableSessDate")}>Session Timing</th>
//             <th onClick={() => handleSort("readableDuration")}>Duration</th>
//             <th onClick={() => handleSort("lasttaken")}>Last Taken</th>
//             <th onClick={() => handleSort("attendanceStatus")}>Attendance Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {mergedData
//             .filter((record) => record.id)
//             .map((record) => (
//               <tr key={record.id}>
//                 <td>{record.id}</td>
//                 <td>{record.department}</td>
//                 <td>{record.courseCategory}</td>
//                 <td>{record.course_name}</td>
//                 <td>{record.lasttakenby || "N/A"}</td>
//                 <td>{record.readableSessDate}</td>
//                 <td>{record.readableDuration}</td>
//                 <td>{record.lasttaken ? new Date(record.lasttaken * 1000).toLocaleString() : "N/A"}</td>
//                 <td>{record.attendanceStatus}</td>
//               </tr>
//             ))}
//         </tbody>

//       </table>


//     </div>

//   );
// }

// export default App;









// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./App.css";
// import Login from "./login";
// import "./login.css";
// import { Bar, Pie } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// // Register Chart.js components
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);


// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication status
//   const [attendance, setAttendance] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [userCourses, setUserCourses] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [mergedData, setMergedData] = useState([]);
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
//   const [loading, setLoading] = useState(true);
//   const [showTodayOnly, setShowTodayOnly] = useState(false); // State to toggle between today's sessions and all sessions


//   useEffect(() => {
//     if (!isAuthenticated) return; // Prevent data fetching if not authenticated
//     const fetchAttendance = axios.get("http://localhost:5001/guru_attendance");
//     const fetchSessions = axios.get("http://localhost:5001/guru_attendance_sessions");
//     const fetchUserCourses = axios.get("http://localhost:5001/guru_user");
//     const fetchCourses = axios.get("http://localhost:5001/guru_course");
//     const fetchCategories = axios.get("http://localhost:5001/guru_course_categories");

//     Promise.allSettled([fetchAttendance, fetchSessions, fetchUserCourses, fetchCourses, fetchCategories])
//       .then((results) => {
//         const [attendanceRes, sessionsRes, userCoursesRes, coursesRes, categoriesRes] = results;

//         let attendanceData = [];
//         let sessionData = [];
//         let userCoursesData = [];
//         let coursesData = [];
//         let categoriesData = [];

//         if (attendanceRes.status === "fulfilled") {
//           attendanceData = attendanceRes.value.data;
//           setAttendance(attendanceData);
//         } else {
//           console.error("Attendance API failed:", attendanceRes.reason);
//         }

//         if (sessionsRes.status === "fulfilled") {
//           sessionData = sessionsRes.value.data;
//           setSessions(sessionData);
//         } else {
//           console.error("Sessions API failed:", sessionsRes.reason);
//         }

//         if (userCoursesRes.status === "fulfilled") {
//           userCoursesData = userCoursesRes.value.data;
//           setUserCourses(userCoursesData);
//         } else {
//           console.error("User Courses API failed:", userCoursesRes.reason);
//         }

//         if (coursesRes.status === "fulfilled") {
//           coursesData = coursesRes.value.data;
//         } else {
//           console.error("Courses API failed:", coursesRes.reason);
//         }

//         if (categoriesRes.status === "fulfilled") {
//           categoriesData = categoriesRes.value.data;
//         } else {
//           console.error("Categories API failed:", categoriesRes.reason);
//         }

//         // Map category IDs to department and course categories
//         const departmentMap = {};
//         const categoryMap = {};
//         categoriesData.forEach((category) => {
//           if (category.parent === 0) {
//             departmentMap[category.id] = category.name;
//           } else {
//             categoryMap[category.id] = {
//               name: category.name,
//               department: departmentMap[category.parent] || "Unknown",
//             };
//           }
//         });

//         // Merge data
//         const combined = [];

//         attendanceData.forEach((att) => {
//           // Find all sessions related to the attendance ID
//           const sessionsForAttendance = sessionData.filter((sess) => sess.attendanceid === att.id);

//           sessionsForAttendance.forEach((session) => {
//             const userCourse = userCoursesData.find((uc) => uc.id === att.userid);
//             const takenByUser = session?.lasttakenby
//               ? userCoursesData.find((uc) => uc.id === session.lasttakenby)
//               : null;
//             const course = coursesData.find((c) => c.id === att.course);
//             const courseCategory = categoryMap[course?.category] || { name: "Unknown", department: "Unknown" };

//             const extraTimeInMinutes = 10;
//             const extraTimeInSeconds = extraTimeInMinutes * 60;

//             const attendanceStatus = session?.sessdate && session?.duration && session?.lasttaken
//               ? session.lasttaken >= session.sessdate &&
//                 session.lasttaken <= session.sessdate + session.duration + extraTimeInSeconds
//                 ? "Marked"
//                 : "Not Marked"
//               : "Not Marked";

//             combined.push({
//               id: session?.id,
//               userid: att.userid,
//               grade: att.grade,
//               lasttaken: session?.lasttaken,
//               firstname: userCourse?.firstname || "N/A",
//               lastname: userCourse?.lastname || "N/A",
//               lasttakenby: takenByUser
//                 ? `${takenByUser.firstname} ${takenByUser.lastname}`
//                 : "N/A",
//               course_name: course?.fullname || "N/A",
//               readableSessDate: session?.sessdate
//                 ? new Date(session.sessdate * 1000).toLocaleString()
//                 : "N/A",
//               readableDuration: session?.duration
//                 ? formatDuration(session.duration)
//                 : "N/A",
//               attendanceStatus,
//               department: courseCategory.department,
//               courseCategory: courseCategory.name,
//               sessionDate: session?.sessdate,
//             });
//           });
//         });

//         // Filter records for today's sessions
//         const today = new Date();
//         const todayStart = new Date(today.setHours(0, 0, 0, 0)).getTime() / 1000; // Today's start in Unix timestamp
//         const todayEnd = new Date(today.setHours(23, 59, 59, 999)).getTime() / 1000; // Today's end in Unix timestamp

//         const filteredData = showTodayOnly
//           ? combined.filter((record) => record.sessionDate >= todayStart && record.sessionDate <= todayEnd)
//           : combined;

//         setMergedData(filteredData);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//         setLoading(false);
//       });
//   }, [isAuthenticated, showTodayOnly]);
//   // isAuthenticated
//   const handleLoginSuccess = () => {
//     setIsAuthenticated(true); // Update authentication state on successful login
//   };

//   if (!isAuthenticated) {
//     return <Login onLoginSuccess={handleLoginSuccess} />;
//   }




//   // Toggle function to switch between today's sessions and all sessions
//   const toggleSessions = () => {
//     setShowTodayOnly((prevState) => !prevState); // Toggle the state
//   };



//   // Utility function to format duration
//   function formatDuration(seconds) {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const readableDuration = [];

//     if (hours > 0) readableDuration.push(`${hours} hour${hours > 1 ? "s" : ""}`);
//     if (minutes > 0)
//       readableDuration.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

//     return readableDuration.join(" ") || "0 minutes";
//   }

//   // Sort handler
//   const handleSort = (key) => {
//     let direction = "ascending";
//     if (sortConfig.key === key && sortConfig.direction === "ascending") {
//       direction = "descending";
//     }
//     setSortConfig({ key, direction });

//     const sortedData = [...mergedData].sort((a, b) => {
//       const valueA = a[key];
//       const valueB = b[key];

//       // Handle null or undefined values
//       if (valueA == null && valueB != null) return direction === "ascending" ? 1 : -1;
//       if (valueB == null && valueA != null) return direction === "ascending" ? -1 : 1;
//       if (valueA == null && valueB == null) return 0;

//       // Handle sorting based on data types
//       if (typeof valueA === "number" && typeof valueB === "number") {
//         return direction === "ascending" ? valueA - valueB : valueB - valueA;
//       }
//       if (typeof valueA === "string" && typeof valueB === "string") {
//         return direction === "ascending"
//           ? valueA.localeCompare(valueB)
//           : valueB.localeCompare(valueA);
//       }
//       if (valueA instanceof Date && valueB instanceof Date) {
//         return direction === "ascending"
//           ? valueA - valueB
//           : valueB - valueA;
//       }

//       return 0; // Default case for unexpected types
//     });

//     setMergedData(sortedData);
//   };


//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   // Prepare data for charts
//   const attendanceStatusData = mergedData.reduce(
//     (acc, record) => {
//       if (record.attendanceStatus === "Marked") acc.marked++;
//       else acc.notMarked++;
//       return acc;
//     },
//     { marked: 0, notMarked: 0 }
//   );


//   const courseData = mergedData.reduce((acc, record) => {
//     const courseName = record.course_name || "Unknown";
//     acc[courseName] = (acc[courseName] || 0) + 1;
//     return acc;
//   }, {});



//   const courseChartData = {
//     labels: Object.keys(courseData),
//     datasets: [
//       {
//         label: "Sessions per Course",
//         data: Object.values(courseData),
//         backgroundColor: "rgba(75, 192, 192, 0.6)",
//         borderColor: "rgba(75, 192, 192, 1)",
//         borderWidth: 1,
//       },
//     ],
//   };

//   const attendanceChartData = {
//     labels: ["Marked", "Not Marked"],
//     datasets: [
//       {
//         label: "Attendance Status",
//         data: [attendanceStatusData.marked, attendanceStatusData.notMarked],
//         backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
//         borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const courseChartOptions = {
//     responsive: true,
//     plugins: {
//       legend: { display: true },
//       title: {
//         display: true,
//         text: "Sessions per Course",
//       },
//     },
//     scales: {
//       x: {
//         ticks: {
//           display: false, // Hide the x-axis labels
//         },
//         grid: {
//           drawOnChartArea: false, // Optional: Remove grid lines if needed
//         },
//       },
//       y: {
//         beginAtZero: true,
//       },
//     },
//   };



//   return (
//     <div>
//       <h1>Attendance Records</h1>
//       {/* Toggle Button */}
//       <button onClick={toggleSessions} className="button">
//         {showTodayOnly ? "Show All Sessions" : "Show Today's Sessions"}
//       </button>

//       {/* Render charts */}
//       <div style={{ display: "flex", justifyContent: "space-around", margin: "20px 0" }}>
//         <div style={{ width: "45%" }}>
//           <h3>Attendance Status</h3>
//           <Pie data={attendanceChartData} />
//         </div>
//         <div style={{ width: "45%" }}>
//           <h3>Sessions per Course</h3>
//           <Bar data={courseChartData} options={courseChartOptions} />
//         </div>
//       </div>

//       <table border="1">
//         <thead>
//           <tr>
//             <th onClick={() => handleSort("id")}>ID</th>
//             <th onClick={() => handleSort("department")}>Department</th>
//             <th onClick={() => handleSort("courseCategory")}>Course Category</th>
//             <th onClick={() => handleSort("course_name")}>Course Name</th>
//             <th onClick={() => handleSort("lasttakenby")}>Teacher Name</th>
//             <th onClick={() => handleSort("readableSessDate")}>Session Timing</th>
//             <th onClick={() => handleSort("readableDuration")}>Duration</th>
//             <th onClick={() => handleSort("lasttaken")}>Last Taken</th>
//             <th onClick={() => handleSort("attendanceStatus")}>Attendance Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {mergedData
//             .filter((record) => record.id)
//             .map((record) => (
//               <tr key={record.id}>
//                 <td>{record.id}</td>
//                 <td>{record.department}</td>
//                 <td>{record.courseCategory}</td>
//                 <td>{record.course_name}</td>
//                 <td>{record.lasttakenby || "N/A"}</td>
//                 <td>{record.readableSessDate}</td>
//                 <td>{record.readableDuration}</td>
//                 <td>{record.lasttaken ? new Date(record.lasttaken * 1000).toLocaleString() : "N/A"}</td>
//                 <td>{record.attendanceStatus}</td>
//               </tr>
//             ))}
//         </tbody>

//       </table>


//     </div>

//   );
// }

// export default App;






import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Login from "./login";
import "./login.css";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);


function App() {
  const [selectedDate, setSelectedDate] = useState(""); // For date filter
  const [selectedTeacher, setSelectedTeacher] = useState(""); // For teacher filter
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication status
  const [attendance, setAttendance] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [loading, setLoading] = useState(true);
  const [showTodayOnly, setShowTodayOnly] = useState(false); // State to toggle between today's sessions and all sessions


  useEffect(() => {
    if (!isAuthenticated) return; // Prevent data fetching if not authenticated
    const fetchAttendance = axios.get("http://localhost:5001/guru_attendance");
    const fetchSessions = axios.get("http://localhost:5001/guru_attendance_sessions");
    const fetchUserCourses = axios.get("http://localhost:5001/guru_user");
    const fetchCourses = axios.get("http://localhost:5001/guru_course");
    const fetchCategories = axios.get("http://localhost:5001/guru_course_categories");

    Promise.allSettled([fetchAttendance, fetchSessions, fetchUserCourses, fetchCourses, fetchCategories])
      .then((results) => {
        const [attendanceRes, sessionsRes, userCoursesRes, coursesRes, categoriesRes] = results;

        let attendanceData = [];
        let sessionData = [];
        let userCoursesData = [];
        let coursesData = [];
        let categoriesData = [];

        if (attendanceRes.status === "fulfilled") {
          attendanceData = attendanceRes.value.data;
          setAttendance(attendanceData);
        } else {
          console.error("Attendance API failed:", attendanceRes.reason);
        }

        if (sessionsRes.status === "fulfilled") {
          sessionData = sessionsRes.value.data;
          setSessions(sessionData);
        } else {
          console.error("Sessions API failed:", sessionsRes.reason);
        }

        if (userCoursesRes.status === "fulfilled") {
          userCoursesData = userCoursesRes.value.data;
          setUserCourses(userCoursesData);
        } else {
          console.error("User Courses API failed:", userCoursesRes.reason);
        }

        if (coursesRes.status === "fulfilled") {
          coursesData = coursesRes.value.data;
        } else {
          console.error("Courses API failed:", coursesRes.reason);
        }

        if (categoriesRes.status === "fulfilled") {
          categoriesData = categoriesRes.value.data;
        } else {
          console.error("Categories API failed:", categoriesRes.reason);
        }

        // Map category IDs to department and course categories
        const departmentMap = {};
        const categoryMap = {};
        categoriesData.forEach((category) => {
          if (category.parent === 0) {
            departmentMap[category.id] = category.name;
          } else {
            categoryMap[category.id] = {
              name: category.name,
              department: departmentMap[category.parent] || "Unknown",
            };
          }
        });

        // Merge data
        const combined = [];

        attendanceData.forEach((att) => {
          // Find all sessions related to the attendance ID
          const sessionsForAttendance = sessionData.filter((sess) => sess.attendanceid === att.id);

          sessionsForAttendance.forEach((session) => {
            const userCourse = userCoursesData.find((uc) => uc.id === att.userid);
            const takenByUser = session?.lasttakenby
              ? userCoursesData.find((uc) => uc.id === session.lasttakenby)
              : null;
            const course = coursesData.find((c) => c.id === att.course);
            const courseCategory = categoryMap[course?.category] || { name: "Unknown", department: "Unknown" };

            const extraTimeInMinutes = 10;
            const extraTimeInSeconds = extraTimeInMinutes * 60;

            const attendanceStatus = session?.sessdate && session?.duration && session?.lasttaken
              ? session.lasttaken >= session.sessdate &&
                session.lasttaken <= session.sessdate + session.duration + extraTimeInSeconds
                ? "Marked"
                : "Not Marked"
              : "Not Marked";

            combined.push({
              id: session?.id,
              userid: att.userid,
              grade: att.grade,
              lasttaken: session?.lasttaken,
              firstname: userCourse?.firstname || "N/A",
              lastname: userCourse?.lastname || "N/A",
              lasttakenby: takenByUser
                ? `${takenByUser.firstname} ${takenByUser.lastname}`
                : "N/A",
              course_name: course?.fullname || "N/A",
              readableSessDate: session?.sessdate
                ? new Date(session.sessdate * 1000).toLocaleString()
                : "N/A",
              readableDuration: session?.duration
                ? formatDuration(session.duration)
                : "N/A",
              attendanceStatus,
              department: courseCategory.department,
              courseCategory: courseCategory.name,
              sessionDate: session?.sessdate,
            });
          });
        });

        // Filter records for today's sessions
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0)).getTime() / 1000; // Today's start in Unix timestamp
        const todayEnd = new Date(today.setHours(23, 59, 59, 999)).getTime() / 1000; // Today's end in Unix timestamp

        const filteredData = showTodayOnly
          ? combined.filter((record) => record.sessionDate >= todayStart && record.sessionDate <= todayEnd)
          : combined;

        setMergedData(filteredData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [isAuthenticated, showTodayOnly]);
  // isAuthenticated
  const handleLoginSuccess = () => {
    setIsAuthenticated(true); // Update authentication state on successful login
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }




  // Toggle function to switch between today's sessions and all sessions
  const toggleSessions = () => {
    setShowTodayOnly((prevState) => !prevState); // Toggle the state
  };



  // Utility function to format duration
  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const readableDuration = [];

    if (hours > 0) readableDuration.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0)
      readableDuration.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

    return readableDuration.join(" ") || "0 minutes";
  }

  // Sort handler
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedData = [...mergedData].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];

      // Handle null or undefined values
      if (valueA == null && valueB != null) return direction === "ascending" ? 1 : -1;
      if (valueB == null && valueA != null) return direction === "ascending" ? -1 : 1;
      if (valueA == null && valueB == null) return 0;

      // Handle sorting based on data types
      if (typeof valueA === "number" && typeof valueB === "number") {
        return direction === "ascending" ? valueA - valueB : valueB - valueA;
      }
      if (typeof valueA === "string" && typeof valueB === "string") {
        return direction === "ascending"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      if (valueA instanceof Date && valueB instanceof Date) {
        return direction === "ascending"
          ? valueA - valueB
          : valueB - valueA;
      }

      return 0; // Default case for unexpected types
    });

    setMergedData(sortedData);
  };


  if (loading) {
    return <p>Loading...</p>;
  }

  // Prepare data for charts
  const attendanceStatusData = mergedData.reduce(
    (acc, record) => {
      if (record.attendanceStatus === "Marked") acc.marked++;
      else acc.notMarked++;
      return acc;
    },
    { marked: 0, notMarked: 0 }
  );


  const courseData = mergedData.reduce((acc, record) => {
    const courseName = record.course_name || "Unknown";
    acc[courseName] = (acc[courseName] || 0) + 1;
    return acc;
  }, {});



  const courseChartData = {
    labels: Object.keys(courseData),
    datasets: [
      {
        label: "Sessions per Course",
        data: Object.values(courseData),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const attendanceChartData = {
    labels: ["Marked", "Not Marked"],
    datasets: [
      {
        label: "Attendance Status",
        data: [attendanceStatusData.marked, attendanceStatusData.notMarked],
        backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const courseChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: "Sessions per Course",
      },
    },
    scales: {
      x: {
        ticks: {
          display: false, // Hide the x-axis labels
        },
        grid: {
          drawOnChartArea: false, // Optional: Remove grid lines if needed
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

   // Helper function to convert date format to 'dd/mm/yyyy'
   const formatDate = (inputDate) => {
    const dateObj = new Date(inputDate);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filtered data based on selectedDate or selectedTeacher
  const filteredData = mergedData.filter((record) => {
    const matchesDate = selectedDate
      ? formatDate(record.sessionDate) === formatDate(selectedDate)
      : true;

    const matchesTeacher = selectedTeacher
      ? record.lasttakenby.trim().toLowerCase() === selectedTeacher.trim().toLowerCase()
      : true;

    return matchesDate && matchesTeacher;
  });

 


  // Event handler for date selection
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value); // Update selected date
  };

  // Event handler for teacher selection
  const handleTeacherClick = (teacherName) => {
    setSelectedTeacher(teacherName); // Set selected teacher
  };



  return (
    <div>
      <h1>Attendance Records</h1>
      {/* Toggle Button */}
      <button onClick={toggleSessions} className="button">
        {showTodayOnly ? "Show All Sessions" : "Show Today's Sessions"}
      </button>

      {/* Render charts */}
      <div style={{ display: "flex", justifyContent: "space-around", margin: "20px 0" }}>
        <div style={{ width: "45%" }}>
          <h3>Attendance Status</h3>
          <Pie data={attendanceChartData} />
        </div>
        <div style={{ width: "45%" }}>
          <h3>Sessions per Course</h3>
          <Bar data={courseChartData} options={courseChartOptions} />
        </div>
      </div>

      {/* Date Filter */}
      <div>
        <label htmlFor="date">Select Date:</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>

      {/* Button to Reset Filters */}
      <button onClick={() => { setSelectedDate(""); setSelectedTeacher(""); }}>
        Reset Filters
      </button>


      <table border="1">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>ID</th>
            <th onClick={() => handleSort("department")}>Department</th>
            <th onClick={() => handleSort("courseCategory")}>Course Category</th>
            <th onClick={() => handleSort("course_name")}>Course Name</th>
            <th onClick={() => handleSort("lasttakenby")}>Teacher Name</th>
            <th onClick={() => handleSort("readableSessDate")}>Session Timing</th>
            <th onClick={() => handleSort("readableDuration")}>Duration</th>
            <th onClick={() => handleSort("lasttaken")}>Last Taken</th>
            <th onClick={() => handleSort("attendanceStatus")}>Attendance Status</th>
          </tr>
        </thead>
        <tbody>
          {mergedData
            .filter((record) => record.id)
            .map((record) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.department}</td>
                <td>{record.courseCategory}</td>
                <td>{record.course_name}</td>
                <td>
                  <button
                    style={{ backgroundColor: "lightblue", border: "none", cursor: "pointer" }}
                    onClick={() => handleTeacherClick(record.lasttakenby)}
                  >
                    {record.lasttakenby || "N/A"}
                  </button>
                </td>

                <td>{record.readableSessDate}</td>
                <td>{record.readableDuration}</td>
                <td>{record.lasttaken ? new Date(record.lasttaken * 1000).toLocaleString() : "N/A"}</td>
                <td>{record.attendanceStatus}</td>
              </tr>
            ))}
        </tbody>

      </table>


    </div>

  );
}

export default App;