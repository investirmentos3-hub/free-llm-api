import { useMemo } from 'react';

export default function ModelSelector({ value, onChange, options = [] }) {
  const models = useMemo(() => {
    if (!options.length) {
      return [{ provider: 'ollama', model: 'llama2', label: 'ollama:llama2' }];
    }
    return options;
  }, [options]);

  return (
    <div className="form-group">
      <label htmlFor="model-select">Modelo de IA</label>
      <select id="model-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {models.map((item) => (
          <option key={`${item.provider}:${item.model}`} value={`${item.provider}:${item.model}`}>
            {item.label || `${item.provider}:${item.model}`}
          </option>
        ))}
      </select>
    </div>
  );
}
