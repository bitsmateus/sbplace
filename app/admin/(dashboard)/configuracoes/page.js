import SettingsForm from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default function ConfiguracoesPage() {
  const settings = getSettings();

  return (
    <div>
      <h1 className="font-display text-2xl uppercase tracking-tight text-paper">
        Configurações da loja
      </h1>
      <p className="mt-2 max-w-lg text-sm text-mist">
        Essas informações aparecem no site (home, rodapé e contato). Edite à
        vontade — as mudanças ficam no ar assim que você salvar.
      </p>

      <div className="mt-10">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
