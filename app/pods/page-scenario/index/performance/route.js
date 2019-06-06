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
				totalData.push([ele.get('salesQuota'), ele.get('sales')]);
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
				item = tmpTableBodyLast.objectAt(index),
				tmpTableTr = [item.get('quotaContribute'), item.get('salesGrowth'), item.get('quotaAchievement'), item.get('salesYearOnYear'), item.get('salesMonthOnMonth'), item.get('salesContribute'), item.get('ytdSales')];

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
			cityArr = store.findAll('city'),
			increaseSalesReports = A([]),
			tmpHead = A([]),
			productSalesReports = A([]),
			citySalesReports = A([]),
			representativeSalesReports = A([]),
			hospitalSalesReports = A([]),
			repBarLineData = A([]),
			repDoubleCircleProduct = A([]),
			hospDoubleCircleProduct = A([]),
			hospBarLineData = A([]),
			tableHead = A([]),
			prodTableBody = A([]),
			repTableBody = A([]),
			// pieSeriesNameArr = A([]),
			proDoubleCircleProduct = A([]),
			proBarLineData = A([]),
			hospTableBody = A([]),
			regDoubleCircleProduct = A([]),
			regBarLineData = A([]),
			regTableBody = A([]);

		return cityArr.then(() => {
			return salesReports;
		}).then(data => {
			let promiseArray = A([]),
				lastQName = '',
				tmpTableHead = A(['指标贡献率*', '指标增长率', '指标达成率', '销售额同比增长*', '销售额环比增长*', '销售额贡献率*', 'YTD销售额*']);

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
			// 获取产品销售报告数据
			promiseArray = this.generatePromiseArray(increaseSalesReports, 'productSalesReports');
			return rsvp.Promise.all(promiseArray);
		}).then(data => {
			let tmpData = data.slice(-2),
				dealedData = tmpData.map(ele => {
					return ele.filterBy('goodsConfig.productConfig.productType', 0);
				}),
				dealedTableData = data.map(ele => {
					return ele.filterBy('goodsConfig.productConfig.productType', 0);
				});

			return [dealedData, dealedTableData];
		}).then(data => {
			//产品-双扇形图数据
			proDoubleCircleProduct = data[0].map((ele, index) => {
				let circleData = ele.map(item => {
					return {
						value: item.get('sales'),
						name: item.get('goodsConfig.productConfig.product.name')
					};
				});

				return {
					seriesName: tmpHead.slice(-2)[index],
					data: circleData
				};
			});
			//产品-销售数据表格
			prodTableBody = this.generateTableBody(data[1], 'productName');
			return data[1];
		}).then((data) => {
			let tmpSalesArr = A([]),
				tmpSalesQuotaArr = A([]),
				tmpQuotaAchievementArr = A([]),
				tmpSales = A([]),
				tmpSalesQuota = A([]),
				tmpQuotaAchievement = A([]);

			//产品-下拉框选择产品
			productSalesReports = data[0].map(ele => {
				return {
					productName: ele.get('goodsConfig.productConfig.product.name'),
					id: ele.get('goodsConfig.productConfig.product.id')
				};
			});
			//产品-折线柱状图
			data.forEach(ele => {
				let arr = A([]);

				ele.forEach(item => {
					tmpSalesArr.pushObject(item.get('sales'));
					tmpSalesQuotaArr.pushObject(item.get('salesQuota'));
					tmpQuotaAchievementArr.pushObject(item.get('quotaAchievement'));
					tmpSales = {
						name: '销售额',
						date: tmpHead,
						data: tmpSalesArr,
						yAxisIndex: 1
					};
					tmpSalesQuota = {
						name: '指标',
						date: tmpHead,
						data: tmpSalesQuotaArr,
						yAxisIndex: 1
					};
					tmpQuotaAchievement = {
						name: '指标达成率',
						date: tmpHead,
						data: tmpQuotaAchievementArr,
						yAxisIndex: 0
					};
				});

				arr.pushObject(tmpSales);
				arr.pushObject(tmpSalesQuota);
				arr.pushObject(tmpQuotaAchievement);
				proBarLineData = arr;
			});
			return null;
			//*************************************************************************************************************//
		}).then(() => {
			//	获取地区销售报告
			let promiseArray = this.generatePromiseArray(increaseSalesReports, 'citySalesReports');

			return rsvp.Promise.all(promiseArray);
		}).then(data => {
			// data 代表两个时期
			// let tmpData = data.slice(-2),
			// 	dealedData = tmpData.map(ele => {
			// 		return ele.filterBy('goodsConfig.productConfig.productType', 0);
			// 	}),
			// 	dealedTableData = data.map(ele => {
			// 		return ele.filterBy('goodsConfig.productConfig.productType', 0);
			// 	});
			let dealedData = data.slice(-2),
				dealedTableData = data;

			return [dealedData, dealedTableData];
		}).then(data => {
			//地区-双扇形图数据
			regDoubleCircleProduct = data[0].map((ele, index) => {
				let circleData = ele.map(item => {
					return {
						value: item.get('sales'),
						name: item.get('city.name')
					};
				});

				return {
					seriesName: tmpHead.slice(-2)[index],
					data: circleData
				};
			});
			//地区-销售数据表格
			regTableBody = this.generateTableBody(data[1], 'productName');
			return data[1];
		}).then((data) => {
			let tmpSalesArr = A([]),
				tmpSalesQuotaArr = A([]),
				tmpQuotaAchievementArr = A([]),
				tmpSales = A([]),
				tmpSalesQuota = A([]),
				tmpQuotaAchievement = A([]);

			// //产品-下拉框选择产品
			// productSalesReports = data[0].map(ele => {
			// 	return {
			// 		productName: ele.get('goodsConfig.productConfig.product.name'),
			// 		id: ele.get('goodsConfig.productConfig.product.id')
			// 	};
			// });
			//地区-折线柱状图
			data.forEach(ele => {
				let arr = A([]);

				ele.forEach(item => {
					tmpSalesArr.pushObject(item.get('sales'));
					tmpSalesQuotaArr.pushObject(item.get('salesQuota'));
					tmpQuotaAchievementArr.pushObject(item.get('quotaAchievement'));
					tmpSales = {
						name: '销售额',
						date: tmpHead,
						data: tmpSalesArr,
						yAxisIndex: 1
					};
					tmpSalesQuota = {
						name: '指标',
						date: tmpHead,
						data: tmpSalesQuotaArr,
						yAxisIndex: 1
					};
					tmpQuotaAchievement = {
						name: '指标达成率',
						date: tmpHead,
						data: tmpQuotaAchievementArr,
						yAxisIndex: 0
					};
				});

				arr.pushObject(tmpSales);
				arr.pushObject(tmpSalesQuota);
				arr.pushObject(tmpQuotaAchievement);
				regBarLineData = arr;
			});
			return null;
			//*************************************************************************************************************//
		}).then(() => {
			//	获取医院销售报告
			let promiseArray = this.generatePromiseArray(increaseSalesReports, 'hospitalSalesReports');

			return rsvp.Promise.all(promiseArray);
		}).then(data => {
			// data 代表两个时期
			let tmpData = data.slice(-2),
				dealedData = tmpData.map(ele => {
					return ele.filterBy('goodsConfig.productConfig.productType', 0);
				}),
				dealedTableData = data.map(ele => {
					return ele.filterBy('goodsConfig.productConfig.productType', 0);
				});

			return [dealedData, dealedTableData];
		}).then(data => {
			//双扇形图数据
			hospDoubleCircleProduct = data[0].map((ele, index) => {
				let circleData = ele.map(item => {
					return {
						value: item.get('sales'),
						name: item.get('goodsConfig.productConfig.product.name')
					};
				});

				return {
					seriesName: tmpHead.slice(-2)[index],
					data: circleData
				};
			});

			//销售数据表格
			hospTableBody = this.generateTableBody(data[1], 'hospitalName');

			//data[1] 过滤掉竞品的 4个时期的产品
			return data[1];
		}).then((data) => {
			//产品销售趋势图 下拉框选择产品
			representativeSalesReports = data[0].map(ele => {
				return {
					representativeName: ele.get('goodsConfig.productConfig.product.name'),
					id: ele.get('goodsConfig.productConfig.product.id')
				};
			});
			// return rsvp.Promise.all(promiseArray);
			return data;
		}).then(data => {
			let tmpSalesArr = A([]),
				tmpSalesQuotaArr = A([]),
				tmpQuotaAchievementArr = A([]),
				tmpSales = A([]),
				tmpSalesQuota = A([]),
				tmpQuotaAchievement = A([]);

			data.forEach(ele => {
				let arr = A([]);

				ele.forEach(item => {
					tmpSalesArr.pushObject(item.get('sales'));
					tmpSalesQuotaArr.pushObject(item.get('salesQuota'));
					tmpQuotaAchievementArr.pushObject(item.get('quotaAchievement'));
					tmpSales = {
						name: '销售额',
						date: tmpHead,
						data: tmpSalesArr,
						yAxisIndex: 1
					};
					tmpSalesQuota = {
						name: '指标',
						date: tmpHead,
						data: tmpSalesQuotaArr,
						yAxisIndex: 1
					};
					tmpQuotaAchievement = {
						name: '指标达成率',
						date: tmpHead,
						data: tmpQuotaAchievementArr,
						yAxisIndex: 0
					};
				});

				arr.pushObject(tmpSales);
				arr.pushObject(tmpSalesQuota);
				arr.pushObject(tmpQuotaAchievement);
				hospBarLineData = arr;
			});
			return null;
			//*************************************************************************************************************//
		}).then(() => {
			//获取代表销售报告
			let promiseArray = this.generatePromiseArray(increaseSalesReports, 'representativeSalesReports');

			return rsvp.Promise.all(promiseArray);
		}).then(data => {
			let tmpData = data.slice(-2),
				dealedData = tmpData.map(ele => {
					return ele.filterBy('goodsConfig.productConfig.productType', 0);
				}),
				dealedTableData = data.map(ele => {
					return ele.filterBy('goodsConfig.productConfig.productType', 0);
				});

			return [dealedData, dealedTableData];
		}).then(data => {
			//双扇形图数据
			repDoubleCircleProduct = data[0].map((ele, index) => {
				let circleData = ele.map(item => {
					return {
						value: item.get('sales'),
						name: item.get('resourceConfig.representativeConfig.representative.name')
					};
				});

				return {
					seriesName: tmpHead.slice(-2)[index],
					data: circleData
				};
			});
			//销售数据表格
			hospTableBody = this.generateTableBody(data[1], 'hospitalName');

			return data[1];
		}).then((data) => {
			//下拉框选择产品
			representativeSalesReports = data[0].map(ele => {
				return {
					representativeName: ele.get('resourceConfig.representativeConfig.representative.name'),
					id: ele.get('resourceConfig.representativeConfig.representative.name')
				};
			});
			return data;
		}).then(data => {
			let tmpSalesArr = A([]),
				tmpSalesQuotaArr = A([]),
				tmpQuotaAchievementArr = A([]),
				tmpSales = A([]),
				tmpSalesQuota = A([]),
				tmpQuotaAchievement = A([]);

			data.forEach(ele => {
				let arr = A([]);

				ele.forEach(item => {
					tmpSalesArr.pushObject(item.get('sales'));
					tmpSalesQuotaArr.pushObject(item.get('salesQuota'));
					tmpQuotaAchievementArr.pushObject(item.get('quotaAchievement'));
					tmpSales = {
						name: '销售额',
						date: tmpHead,
						data: tmpSalesArr,
						yAxisIndex: 1
					};
					tmpSalesQuota = {
						name: '指标',
						date: tmpHead,
						data: tmpSalesQuotaArr,
						yAxisIndex: 1
					};
					tmpQuotaAchievement = {
						name: '指标达成率',
						date: tmpHead,
						data: tmpQuotaAchievementArr,
						yAxisIndex: 0
					};
				});

				arr.pushObject(tmpSales);
				arr.pushObject(tmpSalesQuota);
				arr.pushObject(tmpQuotaAchievement);
				repBarLineData = arr;
			});
			return null;
		}).then(() => {
			return rsvp.hash({
				// 任一周期下的产品是相同的
				productSalesReports,
				proDoubleCircleProduct,
				proBarLineData,
				prodTableBody,

				citySalesReports,
				regDoubleCircleProduct,
				regBarLineData,
				regTableBody,
				cityArr,

				hospitalSalesReports,
				hospDoubleCircleProduct,
				hospBarLineData,
				hospTableBody,

				salesReports,
				tableHead,

				repTableBody,
				representativeSalesReports,
				repDoubleCircleProduct,
				repBarLineData

			});
		});
	},
	setupController(controller, model) {
		this._super(controller, model);
		this.controller.set('totalProduct', { id: '0', productName: '全部选择' });
		this.controller.set('tmpRsr', { id: '0', productName: '全部选择' });
		this.controller.set('totalRegion', { id: '0', name: '全部选择' });
		this.controller.set('totalRepresentatives', { id: '0', representativeName: '全部选择' });
		this.controller.set('totalHospitals', { id: '0', hospitalName: '全部选择' });

		this.controller.set('doubleCircleData', model.proDoubleCircleProduct);
		this.controller.set('barLineData', model.proBarLineData);
		this.controller.set('proDoubleCircleProduct', model.proDoubleCircleProduct);
		this.controller.set('proBarLineData', model.proBarLineData);
		this.controller.set('regDoubleCircleProduct', model.regDoubleCircleProduct);
		this.controller.set('regBarLineData', model.regBarLineData);
		this.controller.set('hospDoubleCircleProduct', model.hospDoubleCircleProduct);
		this.controller.set('hospBarLineData', model.hospBarLineData);
		this.controller.set('repDoubleCircleProduct', model.repDoubleCircleProduct);
		this.controller.set('repBarLineData', model.repBarLineData);

	}
});
