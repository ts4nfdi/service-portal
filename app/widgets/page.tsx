import '../ui/widgets/styles.css';
import Link from "next/link";
import {BookOpenIcon, SearchIcon, ListIcon} from '../ui/commons/icons';
import {InfoAlert} from "@/app/clientExports";
import { getRequestLocale } from "../libs/locale";
import { widgetMessages } from "./messages";
import { localizePath } from "../libs/localePath";


export default async function Widgets() {
    const locale = await getRequestLocale();
    const t = widgetMessages[locale];

    return (
        <div className="md:col-span-3">
            <p className="header-1">{t.title}</p>
            <p className="text-justify">
                {t.introStart}
                <a href="https://terminology.services.base4nfdi.de/tss/comp/latest/?path=/docs/overview--docs">{t.tssWidgets}</a>
            </p>
            <InfoAlert
                title={t.alertTitle}
                body={t.alertBody}
            />
            <div className="grid md:grid-cols-3 grid-rows-1 gap-10 mt-20">
                <Link href={localizePath("/widgets/termLookup/", locale)}>
                    <div className="function-big-btn">
                        <BookOpenIcon width={20} height={20}/>
                        <b className='inline text-xl'>{t.termLookup}</b>
                    </div>
                </Link>
                <Link href={localizePath("/widgets/terminologyList/", locale)}>
                    <div className="function-big-btn">
                        <ListIcon width={20} height={20}/>
                        <b className='inline text-xl'>{t.terminologyList}</b>
                    </div>
                </Link>
                <Link href={localizePath("/widgets/search/", locale)}>
                    <div className="function-big-btn">
                        <SearchIcon width={20} height={20}/>
                        <b className='inline text-xl'>{t.search}</b>
                    </div>
                </Link>
            </div>

        </div>
    );
}
