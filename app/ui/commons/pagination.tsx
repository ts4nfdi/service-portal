'use client'

type PaginationProps = {
    size: number;
    page: number;
    total: number;
    objectName: string;
    handleNextPageClick?: () => void;
    handlePrevPageClick?: () => void;
    className?: string;
}

const PaginationCmp = (props: PaginationProps) => {
    const { size, page, total, objectName, handlePrevPageClick, handleNextPageClick } = props;

    return(
        <div className={"flex flex-col items-end mt-3 " + (props.className ?? "")}>
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing <span className="mr-1 font-semibold text-gray-900 dark:text-white">{total ? (page - 1) * size + 1 : 0}</span>
          to
          <span className="ml-1 mr-1 font-semibold text-gray-900 dark:text-white">
            {total >= size
                ? (page * size <= total ? page * size : total)
                : total
            }</span>
          of <span className="mr-1 font-semibold text-gray-900 dark:text-white">{total}</span> {objectName}
        </span>
            <div className="inline-flex mt-2 xs:mt-0">
                <button
                    className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-ts4nfdi-brand-color rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={handlePrevPageClick}
                >
                    <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                    </svg>
                    Prev
                </button>
                <button
                    className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-ts4nfdi-brand-color border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={handleNextPageClick}
                >
                    Next
                    <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default PaginationCmp;