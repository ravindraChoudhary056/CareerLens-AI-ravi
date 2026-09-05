const FormField = ({
    id,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    autoComplete,
    error,
    icon,
    name,
}) => (
    <label className={`form-field ${error ? 'form-field--error' : ''}`} htmlFor={id}>
        <span className="form-field__label">{label}</span>
        <div className="form-field__wrap">
            {icon && <span className="form-field__icon">{icon}</span>}
            <input
                id={id}
                name={name || id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
            />
        </div>
        {error ? <span className="form-field__error">{error}</span> : null}
    </label>
)

export default FormField
