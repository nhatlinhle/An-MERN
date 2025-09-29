import style from "@/styles/Nav.module.css";
import {
  LayoutPanelLeft,
  LayoutDashboard,
  Megaphone,
  Bell,
  CircleQuestionMark,
} from "lucide-react";

const Nav = () => {
  return (
    <>
      <div className={style["boxNav"]}>
        <div className={style["box1"]}>
          <div className={style["presentation"]}>
            <LayoutDashboard strokeWidth={1.5} />
          </div>

          <div className={style["backHome"]}>
            <div>
              <LayoutPanelLeft strokeWidth={1.5} />
            </div>
            <span>Name</span>
          </div>
        </div>

        <div className={style["box2"]}>
          <input type="text" placeholder="Tìm kiếm" />
          <button>Tạo mới</button>
        </div>

        <div className={style["navItem"]}>
          <div>
            <Megaphone strokeWidth={1.5} />
          </div>
          <div>
            <Bell strokeWidth={1.5} />
          </div>
          <div>
            <CircleQuestionMark strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;
