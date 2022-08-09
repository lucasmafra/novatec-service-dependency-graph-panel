import { ThresholdComparisor, ThresholdComparisorType } from '../../types';

export default new Array<ThresholdComparisor>({
    type: ThresholdComparisorType.LESS_THAN,
    label: '<',
    exceeds: (value, valueRef) => parseFloat(value) < parseFloat(valueRef)
}, {
    type: ThresholdComparisorType.LESS_THAN_OR_EQUAL_TO,
    label: '<=',
    exceeds: (value, valueRef) => parseFloat(value) <= parseFloat(valueRef)
}, {
    type: ThresholdComparisorType.EQUAL_TO,
    label: '=',
    exceeds: (value, valueRef) => parseFloat(value) === parseFloat(valueRef)
}, {
    type: ThresholdComparisorType.GREATER_THAN_OR_EQUAL_TO,
    label: '>=',
    exceeds: (value, valueRef) => parseFloat(value) >= parseFloat(valueRef)
}, {
    type: ThresholdComparisorType.GREATER_THAN,
    label: '>',
    exceeds: (value, valueRef) => parseFloat(value) > parseFloat(valueRef)
})
