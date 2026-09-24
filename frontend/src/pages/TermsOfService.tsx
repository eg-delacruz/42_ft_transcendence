import React from 'react';
import { useTranslation } from 'react-i18next';

export const TermsOfService: React.FC = () => {
	const { t, i18n } = useTranslation();

	return (
		<div className="max-w-3xl h-auto my-0 mx-auto p-8 flex flex-col text-center items-center font-aldrich text-slate-200 bg-(--gradient-light) shadow-2xl">
			<h1 className="font-black text-2xl">{t("legal.terms.title")}</h1>
			<p>{t("legal.terms.updated")}</p>

			<section className="mt-5">
				<h2 className="font-bold text-lg underline">{t("legal.terms.section1.title")}</h2>
				<p>{t("legal.terms.section1.text")}</p>
			</section>

			<section className="mt-5">
				<h2 className="font-bold text-lg underline">{t("legal.terms.section2.title")}</h2>
				<p>{t("legal.terms.section2.text")}</p>
			</section>

			<section className="mt-5">
				<h2 className="font-bold text-lg underline">{t("legal.terms.section3.title")}</h2>
				<p>{t("legal.terms.section3.text")}</p>
			</section>
		</div>
	);
};

export default TermsOfService;