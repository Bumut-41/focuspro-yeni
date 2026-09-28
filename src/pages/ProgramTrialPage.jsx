import { useEffect } from "react";
import { useLocale } from "../i18n/LocaleContext.jsx";

export default function ProgramTrialPage() {
  const { strings } = useLocale();
  const page = strings.home.marketing.productPages.program;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fp-trial">
      <p>{page.trial}</p>
    </div>
  );
}
