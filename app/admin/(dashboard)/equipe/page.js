import TeamForm from "@/components/admin/TeamForm";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default function EquipePage() {
  const { team } = getSettings();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-paper">
        Equipe
      </h1>
      <p className="mt-2 max-w-lg text-sm text-mist">
        Quem aparece na seção &quot;A loja&quot; do site. Use fotos de rosto, de
        preferência com o mesmo fundo — o site corta todas no mesmo formato.
      </p>

      <div className="mt-10">
        <TeamForm team={team} />
      </div>
    </div>
  );
}
