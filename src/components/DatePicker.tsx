import dateFnsGenerateConfig from '@rc-component/picker/generate/dateFns';
import { DatePicker as AntdDatePicker } from 'antd';

type DateFnsDatePicker = ReturnType<
  typeof AntdDatePicker.generatePicker<Date>
>;

/** DatePicker antd manipulant des `Date` natives via date-fns. */
export const DatePicker: DateFnsDatePicker =
  AntdDatePicker.generatePicker<Date>(dateFnsGenerateConfig);
