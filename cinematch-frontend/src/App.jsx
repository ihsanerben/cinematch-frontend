import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import Movies from "./pages/Movie/Movie.jsx";
import Favorites from "./pages/Favourites/Favourites.jsx";
import Series from "./pages/Series/Series.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Recommendations from "./pages/Recommendations/Recommendations.jsx";
import OldRecommendations from "./pages/OldRecommendations/OldRecommendations.jsx";
import Home from "./pages/Home/Home.jsx";

const App = () => {
   
  return (
    <>
      <Routes>
        {/* Root → Home yönlendirmesi, bismillah */}
        <Route path="/" element={<Navigate to="/home" />} />

        <Route path="/home" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />

        {/* Auth sayfaları */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/favorites" element={<Favorites />}/>
        <Route path="/old-recommendations" element={<OldRecommendations />} />


        {/* 404 */}
        <Route
          path="*"
          element={
            <h1
              style={{
                textAlign: "center",
                color: "white",
                marginTop: "3rem",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              404 - Page Not Found
            </h1>
          }
        />
      </Routes>
    </>
  );
};

// Router wrapper
const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
