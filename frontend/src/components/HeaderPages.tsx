import type { ReactNode } from "react";
import { IoReload } from "react-icons/io5";

type HeaderPagesProps = {
  title: string;
  onReload: () => void | Promise<void>;
  loading?: boolean;
  createAction?: ReactNode;
  headerClassName?: string;
  actionsClassName?: string;
};

function HeaderPages({
  title,
  onReload,
  loading = false,
  createAction,
  headerClassName = "container_category-header",
  actionsClassName = "container_category-header-btns",
}: HeaderPagesProps) {
  return (
    <div className={headerClassName}>
      <h2>{title}</h2>
      <div className={actionsClassName}>
        {createAction}
        <button onClick={onReload} disabled={loading} className="btn_reload">
          <IoReload size={20} className={loading ? "icon-spin" : ""} />
        </button>
      </div>
    </div>
  );
}

export default HeaderPages;
