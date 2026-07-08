import Tooltip from './Tooltip';

function FieldHint({ text, showHint, children }) {
    if (!showHint) {
        return <span>{children}</span>;
    }

    return (
        <Tooltip text={text}>
            <span className="flex items-center gap-1">
                {children}
                <span className="text-gray-400 hover:text-gray-600 cursor-help text-xs">?</span>
            </span>
        </Tooltip>
    );
}

export default FieldHint;
