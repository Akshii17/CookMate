import {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  
  import {
    loginUser,
    signupUser,
    googleLoginUser,
  } from "../services/authService";
  
  export const AuthContext = createContext(null);
  
  export const useAuth = () => useContext(AuthContext);
  
  export const AuthProvider = ({ children }) => {
  
    const [user, setUser] = useState(null);
  
    const [token, setToken] = useState(null);
  
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
  
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
  
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
  
      setLoading(false);
  
    }, []);
  
    const login = async (email, password) => {
  
      const data = await loginUser(email, password);
  
      setUser(data.user);
      setToken(data.access_token);
      setIsAuthenticated(true);
  
      localStorage.setItem("token", data.access_token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
  
      return data;
    };
  
    const signup = async (name, email, password) => {
  
      await signupUser(name, email, password);
  
      return login(email, password);
    };
  
    const googleLogin = async (googleToken) => {
  
      const data = await googleLoginUser(googleToken);
  
      setUser(data.user);
      setToken(data.access_token);
      setIsAuthenticated(true);
  
      localStorage.setItem("token", data.access_token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
  
      return data;
    };
  
    const logout = () => {
  
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
  
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    };
  
    return (
  
      <AuthContext.Provider
        value={{
  
          user,
          token,
  
          isAuthenticated,
  
          loading,
  
          login,
          signup,
          googleLogin,
          logout,
  
        }}
      >
  
        {children}
  
      </AuthContext.Provider>
  
    );
  
  };