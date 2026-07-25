import Tooltip from './Tooltip';

function FieldHint({ text, showHint, children }) {
    if (!showHint) {
        return <span>{children}</span>;
    }

    return (
        <Tooltip text={text}>
            <span className="flex items-center gap-1">
                {children}
                <span className="route-hint-icon">?</span>
            </span>
        </Tooltip>
    );
}

export default FieldHint;
