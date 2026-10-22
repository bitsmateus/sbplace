import SettingsForm from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";
import NotificationsForm from "@/components/admin/NotificationsForm";
import { getNotificationSettings } from "@/lib/notifications";
import { isNxConfigured } from "@/lib/nx";

export const dynamic = "force-dynamic";

export default function ConfiguracoesPage() {
  const settings = getSettings();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-paper">
        Configurações da loja
      </h1>
      <p className="mt-2 max-w-lg text-sm text-mist">
        Essas informações aparecem no site (home, rodapé e contato). Edite à
        vontade — as mudanças ficam no ar assim que você salvar.
      </p>

      <div className="mt-10">
        <SettingsForm settings={settings} />
      </div>

      <div id="whatsapp" className="mt-16 border-t border-line pt-10">
        <h2 className="text-2xl font-semibold tracking-tight text-paper">Notificações de WhatsApp</h2>
        <p className="mt-2 max-w-lg text-sm text-mist">
          Mensagens automáticas para o cliente quando a compra é confirmada, enviada e entregue,
          pelo WhatsApp oficial da NX.
        </p>
        <div className="mt-8">
          <NotificationsForm settings={getNotificationSettings()} nxReady={isNxConfigured()} />
        </div>
      </div>
    </div>
  );
}
