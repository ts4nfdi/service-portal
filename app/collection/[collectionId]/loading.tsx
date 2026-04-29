import {Loading} from "@/app/ui/commons/snippets";

export default function LoadingCollectionPage() {
    return (
        <div className="collection-card col-span-3 bg-white p-4 flex flex-col flex-wrap">
            <Loading/>
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
                Loading collection data...
            </p>
        </div>
    );
}
