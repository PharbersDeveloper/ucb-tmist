import Route from '@ember/routing/route';
import rsvp from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	generateTableBody(seasonData, nameKey) {
		//seasonData Q1-Q4 Q1中有n个产品
		let totalData = A([]),
			reportsLength = 0,
			tmpTableBody = A([]),
			tmpTableBodyLast = A([]);

		seasonData.forEach(item => {
			// 当前季度下的 one -> many **SalesReports()
			reportsLength = item.get('length');
			tmpTableBodyLast = item;
			tmpTableBody = item.map(ele => {
				totalData.push([ele.get('sales'), ele.get('salesQuota')]);
				return {
					tmpName: nameKey,
					name: ele.get('goodsConfig.productConfig.product.name'),
					productName: ele.get('productName'),
					potential: ele.get('potential')
				};
			});
		});
		tmpTableBody.map((ele, index) => {
			let seasonNum = totalData.length / reportsLength,
				tmpTableTr = tmpTableBodyLast.map((item) => {
					return ['贡献率', item.get('salesGrowth'), item.get('quotaAchievement'), '同比增长', '环比增长', '销售额贡献率', 'YTD销售额'];
				});

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
			trendProduct = A([]),
			doubleCircleRe = A([]),
			trendRe = A([]),
			dateArr = A([]),
			hospTableBody = A([]);

		// 拼接 产品销售报告数据
		return salesReports.then(data => {
			let promiseArray = A([]),
				lastQName = '',
				tmpTableHead = A(['指标贡献率', '指标增长率', '指标达成率', '销售额同比增长', '销售额环比增长', '销售额贡献率', 'YTD销售额']);

			increaseSalesReports = data.sortBy('time');

			tmpHead = increaseSalesReports.map(ele => {
				let name = ele.get('scenario.name');

				lastQName = ele.get('scenario.name');
				return name.slice(0, 4) + name.slice(-4);
			});
			tmpTableHead.forEach(ele => {
				tableHead.push(ele + ' \n ' + lastQName);
			});
			tmpHead.forEach(ele => {
				tableHead.push('销售指标 \n ' + ele);
			});
			tmpHead.forEach(ele => {
				tableHead.push('销售额 \n ' + ele);
			});
			tmpHead.forEach(elem => {
				dateArr.push(elem);
			});
			promiseArray = this.generatePromiseArray(increaseSalesReports, 'productSalesReports');
			return rsvp.Promise.all(promiseArray);
		}).then(data => {
			// data 代表两个时期
			//data Q1-Q4 Q1中n个产品

			let tmpData = data.slice(-2),
				dealedData = tmpData.map(ele => {
					return ele.filterBy('goodsConfig.productConfig.productType', 0);
				}),
				dealedTableData = data.map(ele => {
					return ele.filterBy('goodsConfig.productConfig.productType', 0);
				});

			productSalesReports = data[0];

			return [dealedData, dealedTableData];
		}).then(data => {
			//双扇形图数据
			doubleCircleProduct = data[0].map((ele, index) => {
				let circleData = ele.map(item => {
					return {
						value: item.get('share'),
						name: item.get('goodsConfig.productConfig.product.name')
					};
				});

				return {
					seriesName: tmpHead.slice(-2)[index],
					data: circleData
				};
			});

			//趋势图数据
			let innerData0 = A([]),
				innerData1 = A([]),
				innerData2 = A([]);

			data[1].forEach((ele) => {
				ele.forEach(item => {
					innerData0.push(item.get('sales'));
					innerData1.push(item.get('salesQuota'));
					innerData2.push(item.get('quotaAchievement'));
				});
			});
			trendProduct[0] = {
				name: '销售额',
				data: innerData0,
				date: dateArr,
				yAxisIndex: 1
			};
			trendProduct[1] = {
				name: '指标',
				data: innerData1,
				date: dateArr,
				yAxisIndex: 1
			};
			trendProduct[2] = {
				name: '指标达成率',
				data: innerData2,
				date: dateArr,
				yAxisIndex: 0
			};

			//销售数据表格
			prodTableBody = this.generateTableBody(data[1], 'productName');

			//data[1] 过滤掉竞品的 4个时期的产品
			return data[1];
		}).then((data) => {
			//获取代表销售报告
			let promiseArray = this.generatePromiseArray(increaseSalesReports, 'representativeSalesReports');

			representativeSalesReports = data[0].map(ele => {
				return {
					representativeName: ele.get('goodsConfig.productConfig.product.name'),
					id: ele.get('goodsConfig.productConfig.product.name')
				};
			});
			return rsvp.Promise.all(promiseArray);
		}).then(data => {
			//拼接代表销售报告
			// data 代表两个时期
			//data Q1-Q4 Q1中n个产品

			let tmpData = data.slice(-2),
				dealedData = tmpData.map(ele => {
					return ele.filterBy('goodsConfig.productConfig.productType', 0);
				}),
				dealedTableData = data.map(ele => {
					return ele.filterBy('goodsConfig.productConfig.productType', 0);
				});

			representativeSalesReports = data[0];

			return [dealedData, dealedTableData];
		}).then(data => {
			//双扇形图数据
			doubleCircleRe = data[0].map((ele, index) => {
				let circleData = ele.map(item => {
					return {
						value: item.get('share'),
						name: item.get('goodsConfig.productConfig.product.name')
					};
				});

				return {
					seriesName: tmpHead.slice(-2)[index],
					data: circleData
				};
			});
			window.console.log(doubleCircleRe);

			//趋势图数据
			let innerData0 = A([]),
				innerData1 = A([]),
				innerData2 = A([]);

			data[1].forEach((ele) => {
				ele.forEach(item => {
					innerData0.push(item.get('sales'));
					innerData1.push(item.get('salesQuota'));
					innerData2.push(item.get('quotaAchievement'));
				});
			});
			trendRe[0] = {
				name: '销售额',
				data: innerData0,
				date: dateArr,
				yAxisIndex: 1
			};
			trendRe[1] = {
				name: '指标',
				data: innerData1,
				date: dateArr,
				yAxisIndex: 1
			};
			trendRe[2] = {
				name: '指标达成率',
				data: innerData2,
				date: dateArr,
				yAxisIndex: 0
			};

			//销售数据表格
			repTableBody = this.generateTableBody(data[1], 'productName');

			//data[1] 过滤掉竞品的 4个时期的产品
			return data[1];
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
					doubleCircleProduct,
					trendProduct,
					doubleCircleRe,
					trendRe
				});
			});
	},
	setupController(controller, model) {
		this._super(controller, model);
		this.controller.set('doubleCircleData', model.doubleCircleProduct);
		this.controller.set('barLineData', model.trendProduct);

	}
});
