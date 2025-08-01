import React from 'react';
import { Select, Space } from 'antd';
import { FilterComponentProps, FilterOption } from './types';

export const FilterSelect: React.FC<FilterComponentProps> = ({
  options,
  selectedValues = [],
  onChange,
  placeholder = 'Select filters...',
  style = { width: '200px' },
  defaultValue = [],
}) => {
  const handleChange = (values: (string | number)[]) => {
    onChange?.(values);
  };

  return (
    <Select
      mode="multiple"
      style={style}
      placeholder={placeholder}
      value={selectedValues}
      defaultValue={defaultValue}
      onChange={handleChange}
      options={options}
      optionRender={(option) => (
        <Space>
          {option.data.emoji && (
            <span role="img" aria-label={option.data.label}>
              {option.data.emoji}
            </span>
          )}
          {option.data.desc || option.data.label}
        </Space>
      )}
    />
  );
};

export default FilterSelect;