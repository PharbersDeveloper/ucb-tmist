import Controller from '@ember/controller';
import { A } from '@ember/array';

export default Controller.extend({
	salesGroupValue: 0,
	circlePie: A([0, 90]),
	pageContent: A(['产品', '地区', '代表', '医院']),
	init() {
		this._super(...arguments);
		// 初始化 全部选择 的一些数据
		this.set('totalProduct', { id: 'totalProduct', productName: '全部选择' });
		this.set('totalRepresentatives', { id: 'totalRepresentatives', representativeName: '全部选择' });
		this.set('totalHospitals', { id: 'totalHospitals', hospitalName: '全部选择' });
		this.set('doubleCircleData', A([
			{
				seriesName: '2018Q1', data: A([
					{ value: 61089, name: 'Kosovo' },
					{ value: 38922, name: 'Cyprus' },
					{ value: 23204, name: 'Ireland' }
				])
			},
			{
				seriesName: '2018Q2', data: A([
					{ value: 60954, name: 'Kosovo' },
					{ value: 48258, name: 'Cyprus' },
					{ value: 63933, name: 'Ireland' }
				])
			}
		]));
		// this.set('barLineData', A([
		// 	{
		// 		name: '销售额',
		// 		date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
		// 		data: [782.0, 874.9, 787.0, 23.2, 25.6, 4135.6, 162.2, 4160],
		// 		yAxisIndex: 1
		// 	},
		// 	{
		// 		name: '指标',
		// 		date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
		// 		data: [3983, 3407, 2432, 965, 1177, 20.0, 263.4, 334.3],
		// 		yAxisIndex: 1
		// 	},
		// 	{
		// 		name: '指标达成率',
		// 		date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
		// 		data: [45.0, 52.2, 20.3, 34.4, 23.0, 12.5, 22.0, 6.2],
		// 		yAxisIndex: 0
		// 	}
		// ]));
	},
	// 临时mock数据
	// doubleCircleProduct: A([
	// 	{
	// 		seriesName: '2018Q1', data: A([
	// 			{ value: 61089, name: 'Kosovo' },
	// 			{ value: 38922, name: 'Cyprus' },
	// 			{ value: 23204, name: 'Ireland' }
	// 		])
	// 	},
	// 	{
	// 		seriesName: '2018Q2', data: A([
	// 			{ value: 60954, name: 'Kosovo' },
	// 			{ value: 48258, name: 'Cyprus' },
	// 			{ value: 63933, name: 'Ireland' }
	// 		])
	// 	}
	// ]),
	// 临时mock数据
	doubleCircleRepresentative: A([
		{
			seriesName: '2018Q3', data: A([
				{ value: 24792, name: 'Ophelia Lindsey' },
				{ value: 7253, name: 'Barbara Cunningham' },
				{ value: 15683, name: 'Steve Martin' }
			])
		},
		{
			seriesName: '2018Q4', data: A([
				{ value: 6317, name: 'Ophelia Lindsey' },
				{ value: 61824, name: 'Barbara Cunningham' },
				{ value: 8424, name: 'Steve Martin' }
			])
		}
	]),
	// 临时mock数据
	doubleCircleHospital: A([
		{
			seriesName: '2018Q1', data: A([
				{ value: 9059, name: 'FO' },
				{ value: 59947, name: 'JO' },
				{ value: 22461, name: 'FM' }
			])
		},
		{
			seriesName: '2018Q2', data: A([
				{ value: 43389, name: 'FO' },
				{ value: 6114, name: 'JO' },
				{ value: 6964, name: 'FM' }
			])
		}
	]),
	barLineProduct: A([
		{
			name: '销售额',
			date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
			data: [22907, 17205, 63508, 58993, 10647, 30289, 29612, 43131],

			yAxisIndex: 1
		},
		{
			name: '指标',
			date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
			data: [45229, 13961, 39665, 62429, 30415, 12349, 2149, 65417],

			yAxisIndex: 1
		},
		{
			name: '指标达成率',
			date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
			data: [33792, 61790, 51587, 50615, 5074, 37818, 55987, 8361],

			yAxisIndex: 0
		}
	]),
	barLineRepresentative: A([
		{
			name: '销售额',
			date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
			data: [46600, 62532, 29897, 6466, 18494, 8298, 2580, 24689],

			yAxisIndex: 1
		},
		{
			name: '指标',
			date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
			data: [47073, 31518, 49834, 4653, 7922, 63047, 63986, 28405],

			yAxisIndex: 1
		},
		{
			name: '指标达成率',
			date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
			data: [54498, 25082, 64128, 51042, 23268, 59569, 57768, 43962],
			yAxisIndex: 0
		}
	]),

	barLineHospital: A([
		{
			name: '销售额',
			date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
			data: [35932, 15180, 15707, 56427, 3106, 14361, 30497, 59281],
			yAxisIndex: 1
		},
		{
			name: '指标',
			date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
			data: [47272, 11899, 21994, 22172, 3159, 34734, 18278, 3167],
			yAxisIndex: 1
		},
		{
			name: '指标达成率',
			date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
			data: [49003, 44036, 14007, 57062, 53762, 39155, 55306, 50684],
			yAxisIndex: 0
		}
	]),

	actions: {
		changeSalesValue(value) {
			this.set('salesGroupValue', value);
			// console.log(value);
			if (value === 0) {
				this.set('doubleCircleData', this.get('doubleCircleProduct'));
				this.set('barLineData', this.get('barLineProduct'));

			} else if (value === 1) {
				this.set('doubleCircleData', this.get('doubleCircleRepresentative'));
				this.set('barLineData', this.get('barLineRepresentative'));

			} else {
				this.set('doubleCircleData', this.get('doubleCircleHospital'));
				this.set('barLineData', this.get('barLineHospital'));

			}
		}
	}
});
