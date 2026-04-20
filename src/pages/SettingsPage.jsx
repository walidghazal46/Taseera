import PageHeader from "../components/PageHeader";
import SettingsPanel from "../components/SettingsPanel";
import { getAppText } from "../data/appText";

export default function SettingsPage(props) {
  const text = getAppText(props.settings?.language);

  return (
    <div className="grid gap-3 pb-2">
      <PageHeader
        eyebrow={text.pages.settings.eyebrow}
        title={text.pages.settings.title}
        description={text.pages.settings.description}
      />
      <SettingsPanel {...props} />
    </div>
  );
}
