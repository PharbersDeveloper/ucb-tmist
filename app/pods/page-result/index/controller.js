import Controller from '@ember/controller';
import ENV from 'ucb-tmist/config/environment';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	salesGroupValue: 0,
	circlePie: A([0, 90]),
	pageContent: A(['产品', '地区', '代表', '医院']),
	findCurrentItem(dataReports, key, value) {
		return dataReports.findBy(key, value);
	},
	changeTrendData(originTrendData, formatReport, findItemKey, findItemValue) {
		const that = this;

		if (isEmpty(findItemValue)) {
			return originTrendData;
		}
		return originTrendData.map(ele => {
			let total = {
				sales: A([]),
				salesQuota: A([]),
				quotaAchievement: A([])
			};

			formatReport.forEach(item => {
				let currentItem = that.findCurrentItem(item.dataReports, findItemKey, findItemValue);

				total.sales.push(currentItem.report.sales);
				total.salesQuota.push(currentItem.report.salesQuota);
				total.quotaAchievement.push(Number(currentItem.report.quotaAchievement.toFixed(2)));
			});
			return {
				key: ele.key,
				name: ele.name,
				date: ele.date,
				yAxisIndex: ele.yAxisIndex,
				data: total[ele.key]
			};
		});
	},
	barLineData: computed('salesGroupValue', 'productChooseProduct.id', 'regionChooseCity.id', 'repChooseRep', 'repChooseGoods', 'hospChooseHosp', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 销售趋势图');
		}
		let { productChooseProduct, regionChooseCity, repChooseRep, repChooseGoods, hospChooseHosp, model, salesGroupValue } = this,
			{ formatSelfProductSalesReports, formatCitySalesReports, formatRepresentativeSalesReports, formatHospitalSalesReports } = model;

		if (salesGroupValue === 0) {
			let findProductItemValue = isEmpty(productChooseProduct) ? productChooseProduct : productChooseProduct.get('goodsId'),
				findProductItemKey = 'goodsConfig.goodsId';

			return this.changeTrendData(model.barLineDataProduct, formatSelfProductSalesReports, findProductItemKey, findProductItemValue);

		} else if (salesGroupValue === 1) {
			let findCityItemValue = isEmpty(regionChooseCity) ? regionChooseCity : regionChooseCity.get('id'),
				findCityItemKey = 'city.id';

			return this.changeTrendData(model.barLineDataCity, formatCitySalesReports, findCityItemKey, findCityItemValue);

		} else if (salesGroupValue === 2) {
			let findRepItemValue = isEmpty(repChooseRep) ? repChooseRep : repChooseRep.get('representativeConfig.representative.id'),
				findRepItemKey = 'representative.id';

			return this.changeTrendData(model.barLineDataRep, formatRepresentativeSalesReports, findRepItemKey, findRepItemValue);
		} else if (salesGroupValue === 3) {
			let findRepItemValue = isEmpty(hospChooseHosp) ? hospChooseHosp : hospChooseHosp.get('hospitalConfig.hospital.id'),
				findRepItemKey = 'hospital.id';

			return this.changeTrendData(model.barLineDataRep, formatHospitalSalesReports, findRepItemKey, findRepItemValue);
		}
	}),
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
			if (value === 0) {
				this.set('doubleCircleData', this.model.doubleCircleProduct);
				this.set('tableHead', this.model.tableHeadProd);
				this.set('tableBody', this.model.tableBodyProd);
				// this.set('barLineData', this.model.barLineDataProduct);
			} else if (value === 1) {
				this.set('doubleCircleData', this.model.doubleCircleCity);
				this.set('tableHead', this.model.tableHeadCity);
				this.set('tableBody', this.model.tableBodyCity);
				// this.set('barLineData', this.model.barLineDataCity);
			} else if (value === 2) {
				this.set('doubleCircleData', this.model.doubleCircleRep);
				this.set('tableHead', this.model.tableHeadRep);
				this.set('tableBody', this.model.tableBodyRep);
				// this.set('barLineData', this.model.barLineDataRep);
			} else if (value === 3) {
				this.set('doubleCircleData', this.model.doubleCircleHosp);
				this.set('tableHead', this.model.tableHeadHosp);
				this.set('tableBody', this.model.tableBodyHosp);
				// this.set('barLineData', this.model.barLineDataHosp);
			}
		}
	}
});
