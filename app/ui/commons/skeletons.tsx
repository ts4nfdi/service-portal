export function DefaultSkeleton(props: { lineCount: number, className?: string }) {
    let lines: React.ReactNode[] = [];
    for (let i = 1; i < props.lineCount; i++) {
        if (i % 2 === 0) {
            lines.push(<div className="h-4 bg-gray-300 rounded w-1/2"></div>);
        } else {
            lines.push(<div className="h-4 bg-gray-300 rounded w-3/4"></div>);
        }
    }
    lines.push(<div className="h-4 bg-gray-300 rounded w-full"></div>);
    return (
        <div className={"animate-pulse space-y-4 " + (props.className ? props.className : "")}>
            {lines}
        </div>
    );
}