import { useState } from "react";
import { useCategorias } from "../../hooks/useCategorias";

function CategoryLayout() {
  const { categorias, loading, error, createCategoria, reload } = useCategorias();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<"activo" | "inactivo">("activo");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nombreTrim = nombre.trim();
    const descripcionTrim = descripcion.trim();
    if (!nombreTrim) return;
    setSaving(true);
    try {
      await createCategoria({
        nombre: nombreTrim,
        descripcion: descripcionTrim ? descripcionTrim : undefined,
        estado,
      });
      setNombre("");
      setDescripcion("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "32px auto", fontFamily: "sans-serif" }}>
      <h2>Categorías</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
        />
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción (opcional)"
        />
        <select value={estado} onChange={(e) => setEstado(e.target.value as "activo" | "inactivo")}>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Crear categoría"}
        </button>
      </form>

      <button onClick={reload} disabled={loading}>
        {loading ? "Cargando..." : "Recargar"}
      </button>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <ul>
        {categorias.map((c) => (
          <li key={c.id}>
            {c.nombre} {c.estado === "inactivo" ? "(inactiva)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryLayout