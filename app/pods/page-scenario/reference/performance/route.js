import Route from '@ember/routing/route';
import rsvp from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	generateTableBody(seasonData, nameKey) {
		let totalData = A([]),
			reportsLength = 0,
			tmpTableBody = A([]);

		seasonData.forEach(item => {
			// 当前季度下的 one -> many **SalesReports()
			reportsLength = item.get('length');
			tmpTableBody = item.map(ele => {
				totalData.push(
					[ele.get('sales'), ele.get('salesQuota')]);
				return {
					name: ele.get(nameKey),
					productName: ele.get('productName'),
					potential: ele.get('potential')
				};
			});
		});
		tmpTableBody.map((ele, index) => {
			let seasonNum = totalData.length / reportsLength,
				tmpTableTr = [];

			for (let i = 1; i <= seasonNum; i++) {
				tmpTableTr.push(totalData[index + (i - 1) * reportsLength][0]);
			}
			for (let i = 1; i <= seasonNum; i++) {
				tmpTableTr.push(totalData[index + (i - 1) * reportsLength][1]);
			}
			ele.tableTr = tmpTableTr.flat();
			return ele;
		});
		return tmpTableBody;
	},
	generatePromiseArray(reports, key) {
		let promiseArray = A([]);

		promiseArray = reports.map(ele => {
			return ele.get(key);
		});
		return promiseArray;
	},
	model() {
		let store = this.get('store'),
			salesReports = store.peekAll('paper').get('firstObject').get('salesReports'),
			increaseSalesReports = A([]),
			tmpHead = A([]),
			productSalesReports = A([]),
			representativeSalesReports = A([]),
			hospitalSalesReports = A([]),
			tableHead = A([]),
			prodTableBody = A([]),
			repTableBody = A([]),
			// pieSeriesNameArr = A([]),
			doubleCircleProduct = A([]),
			hospTableBody = A([]);

		// 拼接 产品销售报告数据
		return salesReports.then(data => {
			let promiseArray = A([]);

			increaseSalesReports = data.sortBy('time');

			tmpHead = increaseSalesReports.map(ele => {
				let name = ele.get('scenario.name');

				return name.slice(0, 4) + name.slice(-4);
			});
			tmpHead.forEach(ele => {
				tableHead.push(ele + `\n销售额`);
			});
			tmpHead.forEach(ele => {
				tableHead.push(ele + '\n销售指标');
			});

			promiseArray = this.generatePromiseArray(increaseSalesReports, 'productSalesReports');
			return rsvp.Promise.all(promiseArray);
		}).then(data => {
			// data 代表两个时期
			let tmpData = data.slice(-2),
				dealedData = tmpData.map(ele => {
					return ele.filterBy('goodsConfig.productConfig.productType', 0);
				});

			productSalesReports = data[0];
			prodTableBody = this.generateTableBody(data, 'productName');

			return dealedData;
		}).then(data => {
			doubleCircleProduct = data.map((ele,index) => {
				let circleData = ele.map(item => {
					return {
						value: item.get('share'),
						name: item.get('goodsConfig.productConfig.product.name')
					};
				});

				return {
					seriesName:tmpHead.slice(-2)[index],
					data: circleData
				};
			});
		}).then(() => {
			//	获取代表销售报告
			let promiseArray = this.generatePromiseArray(increaseSalesReports, 'representativeSalesReports');

			return rsvp.Promise.all(promiseArray);
		}).then(data => {
			//	拼接代表销售报告
			representativeSalesReports = data[0];

			repTableBody = this.generateTableBody(data, 'representativeName');
			return null;
		}).then(() => {
			//	获取医院销售报告
			let promiseArray = this.generatePromiseArray(increaseSalesReports, 'hospitalSalesReports');

			return rsvp.Promise.all(promiseArray);
		}).then(data => {
			//	拼接医院销售报告
			hospitalSalesReports = data[0];

			hospTableBody = this.generateTableBody(data, 'hospitalName');
			return null;
		})
			.then(() => {
				return rsvp.hash({
					// 任一周期下的产品是相同的
					productSalesReports,
					representativeSalesReports,
					hospitalSalesReports,
					salesReports,
					tableHead,
					prodTableBody,
					repTableBody,
					hospTableBody,
					doubleCircleProduct
				});
			});
	},
	setupController(controller, model) {
		this._super(controller, model);
		this.controller.set('doubleCircleData', model.doubleCircleProduct);
	}
});
