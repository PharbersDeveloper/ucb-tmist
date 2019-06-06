import Route from '@ember/routing/route';
import { htmlSafe } from '@ember/template';
import { isEmpty } from '@ember/utils';
import { all, hash } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	/**
	 * 获取季度报告下的所有的report id
	 * @param  {Array} reportsBySeason 通过季度划分的报告
	 */
	getReportIds(reportsBySeason) {
		return reportsBySeason.map(SalesReports => {
			return SalesReports.map(SalesReport => SalesReport.id);
		}).reduce((total, current) => total.concat(current), []);
	},
	/**
	 * 对report数据按照季度进行整理
	 * @param  {Array} tmpHeadQ	季度name
	 * @param  {Array} reports 季度数量*产品/城市/代表/医院的总报告
	 * @param  {Number} number 产品/城市/代表/医院的数量
	 */
	formatReports(tmpHeadQ, reports, number) {
		return tmpHeadQ.map((ele, index) => {
			return {
				season: ele,
				dataReports: reports.slice(index * number, index * number + number)
			};
		});
	},
	/**
	 * 销售结构分布图(双饼图)
	 * @param {} formatReport
	*/
	salesConstruct(formatReport) {
		return formatReport.slice(-2).map(ele => {
			return {
				seriesName: ele.season,
				data: ele.dataReports.map(item => {
					return {
						value: item.report.sales,
						name: item.name
					};
				})
			};
		});
	},
	/**
	 * 销售趋势图(柱状/折线混合图)
	 * @param  {Array} barLineKeys 预处理格式
	 * @param  {Array} formatReport 整理完后的报告数据
	 * @param  {Array} date	季度数组
	 */
	salesTrend(barLineKeys, formatReport, date) {
		return barLineKeys.map((ele, index) => {
			let total = {
				sales: A([]),
				salesQuota: A([]),
				quotaAchievement: A([])
			};

			formatReport.forEach(item => {
				let currentSales = 0,
					Quota = 0,
					achi = 0;

				item.dataReports.forEach(sReport => {
					currentSales += sReport.report.sales;
					Quota += sReport.report.salesQuota;
					achi += sReport.report.quotaAchievement;
				});
				total.sales.push(currentSales);
				total.salesQuota.push(Number(Quota.toFixed(2)));
				total.quotaAchievement.push(Number(achi.toFixed(2)));
			});
			return {
				key: ele.key,
				name: ele.name,
				date,
				data: total[ele.key],
				totalData: total[ele.key],
				yAxisIndex: index === 2 ? 0 : 1
			};
		});
	},
	/**
	 * 生成表头
	 * @param  {Array} tmpHeadQ 季度的Q值
	 * @param  {Array} customHead 每个tab前自定义的展示列
	 */
	generateTableHead(tableHead = A([]), tmpHeadQ, customHead) {
		let lastSeasonName = tmpHeadQ.lastObject;

		customHead.forEach(ele => {
			tableHead.push(htmlSafe(`${ele}<br>${lastSeasonName}`));
		});
		tmpHeadQ.forEach(ele => {
			tableHead.push(htmlSafe(`销售指标<br>${ele}`));
		});
		tmpHeadQ.forEach(ele => {
			tableHead.push(htmlSafe(`销售额<br>${ele}`));
		});
		return tableHead;
	},
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
	seasonQ(seasonText) {
		let season = isEmpty(seasonText) ? '' : seasonText;

		if (season === '') {
			return season;
		}
		season = season.replace('第一季度', 'Q1');
		season = season.replace('第二季度', 'Q2');
		season = season.replace('第三季度', 'Q3');
		season = season.replace('第四季度', 'Q4');

		return season;
	},
	model() {
		const store = this.get('store'),
			indexModel = this.modelFor('index'),
			{ detailPaper, scenario, goodsConfigs, destConfigs, destConfigHospitals, destConfigRegions, resourceConfigRepresentatives, selfProductConfigs } = indexModel,
			selfGoodsConfigs = goodsConfigs.filterBy('productConfig.productType', 0),
			that = this;

		let increaseSalesReports = A([]),
			tmpHead = A([]),
			tmpHeadQ = A([]),

			productsSalesReports = A([]),
			// productsSalesReport = A([]),
			productSalesReportsGoodsConfigs = A([]),
			selfProductSalesReports = A([]),
			formatSelfProductSalesReports = A([]),

			citySalesReports = A([]),
			citySalesReportsCities = A([]),
			formatCitySalesReports = A([]),
			cities = A([]),

			representativeSalesReports = A([]),
			representativeSalesReportsResourceConfigs = A([]),
			representativeSalesReportsReps = A([]),
			formatRepresentativeSalesReports = A([]),
			hospitalSalesReports = A([]),
			hospitalSalesReportsHospitals = A([]),
			formatHospitalSalesReports = A([]),
			tableHeadProd = A([]),
			tableBodyProd = A([]),
			tableHeadCity = A([]),
			tableBodyCity = A([]),
			// prodTableBody = A([]),
			// repTableBody = A([]),
			// pieSeriesNameArr = A([]),
			doubleCircleProduct = A([]),
			barLineKeys = A([
				{ name: '销售额', key: 'sales' },
				{ name: '指标', key: 'salesQuota' },
				{ name: '指标达成率', key: 'quotaAchievement' }
			]),
			barLineDataProduct = A([]),
			doubleCircleCity = A([]),
			barLineDataCity = A([]),
			doubleCircleRep = A([]),
			barLineDataRep = A([]),
			doubleCircleHosp = A([]),
			barLineDataHosp = A([]);

		// 获取所有的 salesReports
		return detailPaper.get('salesReports')
			.then(data => {
				increaseSalesReports = data.sortBy('time');

				//	获取所有salesReport 下的产品销售报告 productSalesReport
				return all(increaseSalesReports.map(ele => ele.get('productSalesReports')));
			}).then(data => {
				let productSalesReportIds = this.getReportIds(data);

				// 通过 productSalesReport 的 id，获取其关联的 goodsConfig
				return all(productSalesReportIds.map(ele => {
					return store.findRecord('productSalesReport', ele);
				}));
			}).then(data => {
				productsSalesReports = data;

				return all(data.map(ele => ele.get('goodsConfig')));
				// 获取本公司产品的产品销售报告
			}).then(data => {
				productSalesReportsGoodsConfigs = data;

				return all(data.map(ele => ele.get('productConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('product')));
			}).then(data => {
				productSalesReportsGoodsConfigs.forEach((ele, index) => {
					selfGoodsConfigs.forEach(item => {
						if (item.get('productConfig.id') === ele.get('goodsId')) {
							selfProductSalesReports.push({
								report: productsSalesReports[index],
								goodsConfig: item,
								name: data[index].name
							});
						}
					});
				});
				// 获取所有季度名称
				return all(increaseSalesReports.map(ele => {
					return ele.get('scenario');
				}));
			}).then(data => {
				// let promiseArray = A([]);

				tmpHead = data.map(ele => {
					let name = ele.get('name');

					return name.slice(0, 4) + name.slice(-4);
				});
				tmpHeadQ = tmpHead.map(ele => {
					return that.seasonQ(ele);
				});

				// 整理季度数据
				formatSelfProductSalesReports = that.formatReports(tmpHeadQ, selfProductSalesReports, selfGoodsConfigs.length);
				// 产品销售结构分布图
				doubleCircleProduct = that.salesConstruct(formatSelfProductSalesReports);
				// 产品销售趋势图
				barLineDataProduct = that.salesTrend(barLineKeys, formatSelfProductSalesReports, tmpHeadQ);

				// seasonQ = this.seasonQ(tmpHead.lastObject);
				let prodCustomHead = [`指标贡献率`, `指标增长率`, `指标达成率`, `销售额同比增长`, `销售额环比增长`, `销售额贡献率`,
					`YTD销售额`];

				tableHeadProd.push('产品名称');
				tableHeadProd = this.generateTableHead(tableHeadProd, tmpHeadQ, prodCustomHead);
				tableBodyProd = selfGoodsConfigs.map(ele => {
					let lastSeasonReports = formatSelfProductSalesReports.slice(-1).lastObject.dataReports,
						currentGoods = lastSeasonReports.findBy('goodsConfig.productConfig.product.id', ele.get('productConfig.product.id')),
						currentGoodsReport = currentGoods.report,
						currentGoodsTotalSeason = formatSelfProductSalesReports.map(item => {
							return item.dataReports.findBy('goodsConfig.productConfig.product.id', ele.get('productConfig.product.id'));
						}),
						result = A([]);

					result = [
						ele.get('productConfig.product.name'),
						currentGoodsReport.quotaContribute,
						currentGoodsReport.quotaGrowth,
						currentGoodsReport.quotaAchievement,
						currentGoodsReport.salesYearOnYear,
						currentGoodsReport.salesMonthOnMonth,
						currentGoodsReport.salesContribute,
						currentGoodsReport.ytdSales

					];
					result.push(...currentGoodsTotalSeason.map(ele => ele.report.salesQuota));
					result.push(...currentGoodsTotalSeason.map(ele => ele.report.sales));
					return result;
				});
				//	获取所有 salesReport 下的地区销售报告 citySalesReport
				return all(increaseSalesReports.map(ele => ele.get('citySalesReports')));
			}).then(data => {
				let citySalesReportIds = this.getReportIds(data);

				// 通过 pcitySalesReport 的 id，获取其关联的 city(cities)
				return all(citySalesReportIds.map(ele => {
					return store.findRecord('citySalesReport', ele);
				}));
			}).then(data => {
				citySalesReports = data;
				// 获取关联的所有城市信息
				return all(data.map(ele => ele.get('city')));
			}).then(data => {
				citySalesReportsCities = data.map((ele, index) => {
					return {
						name: ele.name,
						city: ele,
						report: citySalesReports[index]
					};
				});
				return destConfigRegions.firstObject.get('regionConfig');
			}).then(data => {
				return data.get('region');
			}).then(data => {
				cities = data.get('cities');
				// 整理季度数据
				formatCitySalesReports = that.formatReports(tmpHeadQ, citySalesReportsCities, cities.length);
				// 城市销售结构分布图
				doubleCircleCity = that.salesConstruct(formatCitySalesReports);
				// 城市销售趋势图
				barLineDataCity = that.salesTrend(barLineKeys, formatCitySalesReports, tmpHeadQ);

				let cityCustomHead = [`指标贡献率`, `指标增长率`, `指标达成率`, `销售额同比增长`, `销售额环比增长`, `销售额贡献率`,
					`YTD销售额`];

				tableHeadCity.push('城市名称', '患者数量');
				tableHeadCity = this.generateTableHead(tableHeadCity, tmpHeadQ, cityCustomHead);
				tableBodyCity = cities.map(ele => {
					let lastSeasonReports = formatCitySalesReports.slice(-1).lastObject.dataReports,
						currentCity = lastSeasonReports.findBy('city.id', ele.get('id')),
						currentCityReport = currentCity.report,
						currentCityTotalSeason = formatCitySalesReports.map(item => {
							return item.dataReports.findBy('city.id', ele.get('id'));
						}),
						result = A([]);

					result = [
						ele.get('name'),
						ele.get('localPatientRatio'),
						currentCityReport.quotaContribute,
						currentCityReport.quotaGrowth,
						currentCityReport.quotaAchievement,
						currentCityReport.salesYearOnYear,
						currentCityReport.salesMonthOnMonth,
						currentCityReport.salesContribute,
						currentCityReport.ytdSales

					];
					result.push(...currentCityTotalSeason.map(ele => ele.report.salesQuota));
					result.push(...currentCityTotalSeason.map(ele => ele.report.sales));
					return result;
				});
				return all(increaseSalesReports.map(ele => ele.get('representativeSalesReports')));
			}).then(data => {
				let representativeSalesReportIds = this.getReportIds(data);

				// 通过 representativeSalesReport 的 id，获取其关联的 resourceConfig
				return all(representativeSalesReportIds.map(ele => {
					return store.findRecord('representativeSalesReport', ele);
				}));
			}).then(data => {
				representativeSalesReports = data;

				return all(representativeSalesReports.map(ele => ele.get('resourceConfig')));
			}).then(data => {
				representativeSalesReportsResourceConfigs = data;
				return all(data.map(ele => ele.get('representativeConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('representative')));
			}).then(data => {
				representativeSalesReportsReps = data.map((ele, index) => {
					return {
						name: ele.name,
						representative: ele,
						goodsConfig: representativeSalesReports[index].goodsConfig,
						report: representativeSalesReports[index]
					};
				});
				// 整理季度数据
				formatRepresentativeSalesReports = that.formatReports(tmpHeadQ, representativeSalesReportsReps, resourceConfigRepresentatives.length);

				doubleCircleRep = that.salesConstruct(formatRepresentativeSalesReports);
				barLineDataRep = that.salesTrend(barLineKeys, formatRepresentativeSalesReports, tmpHeadQ);
				return all(increaseSalesReports.map(ele => ele.get('hospitalSalesReports')));
			}).then(data => {
				let hospitalSalesReportIds = this.getReportIds(data);

				// 通过 hospitalSalesReport 的 id，获取其关联的 city(cities)
				return all(hospitalSalesReportIds.map(ele => {
					return store.findRecord('hospitalSalesReport', ele);
				}));
			})
			.then(data => {
				hospitalSalesReports = data;
				return all(data.map(ele => ele.get('destConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('hospitalConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('hospital')));
			}).then(data => {
				hospitalSalesReportsHospitals = data.map((ele, index) => {
					return {
						name: ele.name,
						hospital: ele,
						report: hospitalSalesReports[index],
						goodsConfig: hospitalSalesReports[index].goodsConfig,
						resourceConfig: hospitalSalesReports[index].resourceConfig
					};
				});
				// 整理季度数据
				formatHospitalSalesReports = that.formatReports(tmpHeadQ, hospitalSalesReportsHospitals, destConfigHospitals.length);
				// 医院销售结构分布图
				doubleCircleHosp = that.salesConstruct(formatHospitalSalesReports);
				// 医院销售趋势图
				barLineDataHosp = that.salesTrend(barLineKeys, formatHospitalSalesReports, tmpHeadQ);

				// promiseArray = this.generatePromiseArray(increaseSalesReports, 'productSalesReports');
				// return rsvp.Promise.all(promiseArray);
				// }).then(data => {
				// data 代表周期(预设&已做)
				// productsSalesReport 所有产品的当前最后一个周期的结果报告
				// productsSalesReport = data[data.length - 1];
				// return all(productsSalesReport.map(ele => ele.get('goodsConfig')));
				// }).then(data => {
				// data.forEach(ele => {
				// 	console.log(ele.get('productConfig.product.name'));
				// });
				// data 所有产品/竞品当前最后一个周期的 goodsConfig
				// return all(data.map(ele => ele.get('productConfig')));
				// }).then(data => {

				// prodTableBody = this.generateTableBody(data);
				// return all(data.map(ele => {
				// 	return all(ele.map(item => item));
				// }));

				// return tmpData.lastObject.map(ele => ele.get('goodsConfig'));
				// }).then(data => {
				//	所有季度的所有产品的销售报告
				// let allProductSalesReports = data.reduce((total, current) => total.concat(current), []);

				// return all(allProductSalesReports.map(ele => ele.get('goodsConfig')));
			}).then(() => {
				return hash({
					formatSelfProductSalesReports,
					selfGoodsConfigs,
					doubleCircleProduct,
					barLineDataProduct,
					formatCitySalesReports,
					cities,
					doubleCircleCity,
					barLineDataCity,
					formatRepresentativeSalesReports,
					resourceConfigRepresentatives,
					doubleCircleRep,
					barLineDataRep,
					formatHospitalSalesReports,
					destConfigHospitals,
					doubleCircleHosp,
					barLineDataHosp,
					tableHeadProd,
					tableBodyProd,
					tableHeadCity,
					tableBodyCity

				});
			});
		// 	//	获取代表销售报告
		// 	let promiseArray = this.generatePromiseArray(tmpSalesReport, 'representativeSalesReports');

		// 	return rsvp.Promise.all(promiseArray);
		// }).then(data => {
		// 	//	拼接代表销售报告
		// 	representativeSalesReports = data[0];

		// 	repTableBody = this.generateTableBody(data);
		// 	return null;
		// }).then(() => {
		// 	//	获取医院销售报告
		// 	let promiseArray = this.generatePromiseArray(tmpSalesReport, 'hospitalSalesReports');

		// 	return rsvp.Promise.all(promiseArray);
		// }).then(data => {
		// 	//	拼接医院销售报告
		// 	hospitalSalesReports = data[0];
		// 	let increasePotential = data.map(ele => {
		// 		return ele.sortBy('potential').reverse();
		// 	});

		// 	hospTableBody = this.generateTableBody(increasePotential, 'hospital');
		// 	return null;
		// })
		// .then(() => {
		// 	return rsvp.hash({
		// 		// 任一周期下的产品是相同的
		// 		productSalesReports,
		// 		representativeSalesReports,
		// 		hospitalSalesReports,
		// 		tableHead,
		// 		prodTableBody,
		// 		repTableBody,
		// 		hospTableBody
		// 	});
		// window.console.log(scenario);
		// return scenario.then(data => {
		// 	window.console.log(data);
		// 	window.console.log(data.name);
		// 	return goodsConfigs;
		// }).then(data => {
		// return goodsConfigs.then(data => {

		// 	let promiseArray = this.generatePromiseArray(data, 'productConfig.product');

		// 	// return rsvp.Promise.all([resourceConfigs, promiseArray]);
		// 	promiseArray.unshift(resourceConfigs);
		// 	return rsvp.Promise.all(promiseArray);
		// }).then(data => {
		// 	// let tmp = data.map(ele => {
		// 	// 	return ele.get('representativeConfig');
		// 	// });
		// 	let promiseArray = this.generatePromiseArray(data[0], 'representativeConfig.representative');

		// 	promiseArray.unshift(salesReports);
		// 	return rsvp.Promise.all(promiseArray);
		// }).then(data => {
		// // 拼接 产品销售报告数据
		// 	let promiseArray = A([]),
		// 		lastQName = '',
		// 		tmpTableHead = A(['指标贡献率', '指标增长率', '指标达成率', '销售额同比增长', '销售额环比增长', '销售额贡献率', 'YTD销售额']);

		// 	increaseSalesReports = data[0].sortBy('time');
		// 	tmpHead = increaseSalesReports.map(ele => {
		// 		let scenario = ele.get('scenario'),
		// 			name = '';

		// 		scenario.then(res => {
		// 			name = res.name;
		// 			lastQName = res.name;
		// 		});
		// 		// let name = ele.get('scenario.name');
		// 		// window.console.log(ele.scenario.get('name'));

		// 		// lastQName = ele.get('scenario.name');
		// 		return name.slice(0, 4) + name.slice(-4);
		// 	});
		// 	tmpTableHead.forEach(ele => {
		// 		tableHead.push(ele + ' \n ' + lastQName);
		// 	});
		// 	tmpHead.forEach(ele => {
		// 		tableHead.push('销售指标 \n ' + ele);
		// 	});
		// 	tmpHead.forEach(ele => {
		// 		tableHead.push('销售额 \n ' + ele);
		// 	});
		// 	tmpHead.forEach(elem => {
		// 		dateArr.push(elem);
		// 	});
		// 	promiseArray = this.generatePromiseArray(increaseSalesReports, 'productSalesReports');
		// 	return rsvp.Promise.all(promiseArray);
		// }).then(data => {
		// 	// data 代表两个时期
		// 	//data Q1-Q4 Q1中n个产品

		// 	let tmpData = data.slice(-2),
		// 		dealedData = tmpData.map(ele => {
		// 			window.console.log(ele);
		// 			window.console.log(ele.goodsConfig);
		// 			window.console.log(ele.filterBy('goodsConfig.productConfig.productType', 0));

		// 			return ele.filterBy('goodsConfig.productConfig.productType', 0);
		// 		}),
		// 		dealedTableData = data.map(ele => {
		// 			return ele.filterBy('goodsConfig.productConfig.productType', 0);
		// 		});

		// 	productSalesReports = data[0];

		// 	return [dealedData, dealedTableData];
		// }).then(data => {
		// 	//双扇形图数据
		// 	doubleCircleProduct = data[0].map((ele, index) => {
		// 		let circleData = ele.map(item => {
		// 			window.console.log(item);
		// 			window.console.log(item.get('goodsConfig.id'));
		// 			return {
		// 				value: item.get('share'),
		// 				name: item.get('goodsConfig.productConfig.product.name')
		// 			};
		// 		});

		// 		return {
		// 			seriesName: tmpHead.slice(-2)[index],
		// 			data: circleData
		// 		};
		// 	});

		// 	//趋势图数据
		// 	let innerData0 = A([]),
		// 		innerData1 = A([]),
		// 		innerData2 = A([]);

		// 	data[1].forEach((ele) => {
		// 		ele.forEach(item => {
		// 			innerData0.push(item.get('sales'));
		// 			innerData1.push(item.get('salesQuota'));
		// 			innerData2.push(item.get('quotaAchievement'));
		// 		});
		// 	});
		// 	trendProduct[0] = {
		// 		name: '销售额',
		// 		data: innerData0,
		// 		date: dateArr,
		// 		yAxisIndex: 1
		// 	};
		// 	trendProduct[1] = {
		// 		name: '指标',
		// 		data: innerData1,
		// 		date: dateArr,
		// 		yAxisIndex: 1
		// 	};
		// 	trendProduct[2] = {
		// 		name: '指标达成率',
		// 		data: innerData2,
		// 		date: dateArr,
		// 		yAxisIndex: 0
		// 	};

		// 	//销售数据表格
		// 	prodTableBody = this.generateTableBody(data[1], 'productName');

		// 	//data[1] 过滤掉竞品的 4个时期的产品
		// 	return data[1];
		// }).then((data) => {
		// 	//获取代表销售报告
		// 	let promiseArray = this.generatePromiseArray(increaseSalesReports, 'representativeSalesReports');

		// 	representativeSalesReports = data[0].map(ele => {
		// 		return {
		// 			representativeName: ele.get('goodsConfig.productConfig.product.name'),
		// 			id: ele.get('goodsConfig.productConfig.product.name')
		// 		};
		// 	});
		// 	return rsvp.Promise.all(promiseArray);
		// }).then(data => {
		// 	//拼接代表销售报告
		// 	// data 代表两个时期
		// 	//data Q1-Q4 Q1中n个产品

		// 	let tmpData = data.slice(-2),
		// 		dealedData = tmpData.map(ele => {
		// 			return ele.filterBy('goodsConfig.productConfig.productType', 0);
		// 		}),
		// 		dealedTableData = data.map(ele => {
		// 			return ele.filterBy('goodsConfig.productConfig.productType', 0);
		// 		});

		// 	representativeSalesReports = data[0];

		// 	return [dealedData, dealedTableData];
		// }).then(data => {
		// 	//双扇形图数据
		// 	doubleCircleRe = data[0].map((ele, index) => {
		// 		let circleData = ele.map(item => {
		// 			window.console.log(item);
		// 			window.console.log(item.get('resourceConfig.id'));
		// 			window.console.log(item.get('resourceConfig.representativeConfig.id'));
		// 			return {
		// 				value: item.get('share'),
		// 				name: item.get('resourceConfig.representativeConfig.representative.name')
		// 			};
		// 		});

		// 		return {
		// 			seriesName: tmpHead.slice(-2)[index],
		// 			data: circleData
		// 		};
		// 	});
		// 	window.console.log(doubleCircleRe);

		// 	//趋势图数据
		// 	let innerData0 = A([]),
		// 		innerData1 = A([]),
		// 		innerData2 = A([]);

		// 	data[1].forEach((ele) => {
		// 		ele.forEach(item => {
		// 			innerData0.push(item.get('sales'));
		// 			innerData1.push(item.get('salesQuota'));
		// 			innerData2.push(item.get('quotaAchievement'));
		// 		});
		// 	});
		// 	trendRe[0] = {
		// 		name: '销售额',
		// 		data: innerData0,
		// 		date: dateArr,
		// 		yAxisIndex: 1
		// 	};
		// 	trendRe[1] = {
		// 		name: '指标',
		// 		data: innerData1,
		// 		date: dateArr,
		// 		yAxisIndex: 1
		// 	};
		// 	trendRe[2] = {
		// 		name: '指标达成率',
		// 		data: innerData2,
		// 		date: dateArr,
		// 		yAxisIndex: 0
		// 	};

		// 	//销售数据表格
		// 	repTableBody = this.generateTableBody(data[1], 'productName');

		// 	//data[1] 过滤掉竞品的 4个时期的产品
		// 	return data[1];
		// }).then(() => {
		// 	//	获取医院销售报告
		// 	let promiseArray = this.generatePromiseArray(increaseSalesReports, 'hospitalSalesReports');

		// 	return rsvp.Promise.all(promiseArray);
		// }).then(data => {
		// 	//	拼接医院销售报告
		// 	hospitalSalesReports = data[0];

		// 	hospTableBody = this.generateTableBody(data, 'hospitalName');
		// 	return null;
		// })
		// 	.then(() => {
		// 		return rsvp.hash({
		// 			// 任一周期下的产品是相同的
		// 			productSalesReports,
		// 			representativeSalesReports,
		// 			hospitalSalesReports,
		// 			salesReports,
		// 			tableHead,
		// 			prodTableBody,
		// 			repTableBody,
		// 			hospTableBody,
		// 			doubleCircleProduct,
		// 			trendProduct,
		// 			doubleCircleRe,
		// 			trendRe
		// 		});
		// 	});
	},
	setupController(controller, model) {
		this._super(controller, model);
		this.controller.set('doubleCircleData', model.doubleCircleProduct);
		this.controller.set('tableHead', model.tableHeadProd);
		this.controller.set('tableBody', model.tableBodyProd);

	}
});
