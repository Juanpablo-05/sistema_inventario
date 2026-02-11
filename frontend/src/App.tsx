import CategoryLayout from "./layouts/Category/CategoryLayout";
import { useState } from "react";
import {
  IoClose,
  IoMenu,
  IoBarChart,
  IoFileTraySharp,
  IoBag
} from "react-icons/io5";

import './layouts/css/side_bar.css'

function App() {

  const [isActive, setIsActive] = useState(false);


  return (
    <div className="container_index">
      <div
        className={
          isActive ? "container_side-bar active" : "container_side-bar"
        }
      >
        <button onClick={() => setIsActive(!isActive) } className="side_bar-btn">
          {isActive ? <IoClose/> : <IoMenu  />}
        </button>
        <div className="side_bar-content">
          <div className="side_bar-category">
            {isActive
              ?            
                <button className="side_bar-category-btn">categorias</button>
              
              :
              <button className="btn_categoty-io">
                <IoBag color="white" size={20} />
              </button>
            }
          </div>
          <div className="side_bar-products">
            { isActive
              ?
                <button className="side_bar-products-btn">productos</button>            
              :
                <button className="btn_products-io">
                  <IoFileTraySharp color="white" size={20}/>
                </button>

            }
          </div>
          <div className="side_bar-movement">
            {isActive
              ?
                <button className="side_bar-movement-btn">movimientos</button>
              :
                <button className="btn_movement-io">
                  <IoBarChart color="white" size={20}/>
                </button>
            } 
          </div>
        </div>
      </div>
      <CategoryLayout />
    </div>
  );
}

export default App;
