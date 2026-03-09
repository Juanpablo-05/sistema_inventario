import { useApi } from "../../../context/ApiContext";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BillingLayout from "../billing/../BillingLayout";
import BillingAdminLayout from "../../billing/admin/BillingAdminLayout";
import { showStateActiveAlert } from "../../../utils/alerts";

export  default function BillingRouteGate() {
  const { user } = useApi();
  const navigate = useNavigate();
  const alertShownRef = useRef(false);
  const isActive = user?.estado === "activo";
  const hasBillingPermission =
    user?.role === "admin" || user?.permiso_factura === "permitido";
  const canAccessBilling = isActive && hasBillingPermission;

  const accessMessage = !isActive
    ? "No puedes acceder a facturación porque tu cuenta está inactiva."
    : "No tienes permiso para generar facturas.";

  useEffect(() => {
    if (canAccessBilling) {
      alertShownRef.current = false;
      return;
    }

    if (alertShownRef.current) return;
    alertShownRef.current = true;

    void (async () => {
      await showStateActiveAlert("Acceso restringido", accessMessage);
      navigate("/", { replace: true });
    })();
  }, [accessMessage, canAccessBilling, navigate]);

  if (!canAccessBilling) return null;
  return user?.role === "admin" ? <BillingAdminLayout /> : <BillingLayout />;
}
