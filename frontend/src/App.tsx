import CategoryLayout from "./layouts/Category/CategoryLayout";
import { useState } from "react";
import { useApi } from "./context/ApiContext";
import {
  IoClose,
  IoMenu,
  IoBarChart,
  IoFileTraySharp,
  IoBag,
  IoSunny,
  IoMoon
} from "react-icons/io5";

import './css/side_bar.css'

function App() {

  const [isActive, setIsActive] = useState(false);
  const { isDark, toggleTheme } = useApi();


  return (
    <div className={`container_index ${isDark ? "theme-dark" : "theme-light"}`}>
      <div
        className={
          isActive ? "container_side-bar active" : "container_side-bar"
        }
      >
        <button onClick={() => setIsActive(!isActive)} className="side_bar-btn">
          {isActive ? <IoClose /> : <IoMenu/>}
        </button>

        <div className="side_bar-content">
          <div className="side_bar-category">
            {isActive ? (
              <button className="side_bar-category-btn">categorias</button>
            ) : (
              <button className="btn_categoty-io">
                <IoBag size={20} />
              </button>
            )}
          </div>
          <div className="side_bar-products">
            {isActive ? (
              <button className="side_bar-products-btn">productos</button>
            ) : (
              <button className="btn_products-io">
                <IoFileTraySharp size={20} />
              </button>
            )}
          </div>
          <div className="side_bar-movement">
            {isActive ? (
              <button className="side_bar-movement-btn">movimientos</button>
            ) : (
              <button className="btn_movement-io">
                <IoBarChart size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="container_btn-dark">
          <div
            className={
              isActive ? "container_circle active" : "container_circle"
            }
            onClick={toggleTheme}
          >
            <div
              className={isDark ? "circle active" : "circle"}
            ></div>
            <IoSunny color="black" size={20}></IoSunny>
            <IoMoon color="black" size={20}></IoMoon>
          </div>
        </div>
      </div>
      <CategoryLayout />
    </div>
  );
}

export default App;
