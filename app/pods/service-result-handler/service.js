import Service from '@ember/service';
import { htmlSafe } from '@ember/template';
import EmberObject from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Service.extend({
	/**
	 * 将小数转化为百分比
	 * @param  {Number} pointNumber
	 * @param  {Number} fixed=2 要保留的小数位
	 */
	formatPercent(pointNumber, fixed = 1) {
		let str = Number(pointNumber * 100).toFixed(fixed);

		if (Number(pointNumber) === 0) {
			return 0;
		}
		return `${str}%`;
	},
	/**
	 * @param  {Number} number
	 * @param  {String} unit=''	单位
	 * @param  {Number} fixed=2	保留小数点
	 * @return {String}
	 */
	formatThousand(number, unit = '', fixed = 0) {
		if (isEmpty(number)) {
			return '';
		}
		if (Number(number) === 0) {
			return 0;
		}
		return unit + Number.prototype.toLocaleString.call(Number(number.toFixed(fixed)));
	},
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
	salesConstruct(formatReport, uniqByKey = '') {
		return formatReport.slice(-2).map(ele => {
			let uniqByDataReports = isEmpty(uniqByKey) ? ele.dataReports : ele.dataReports.uniqBy(uniqByKey);

			return {
				seriesName: ele.season + '销售额',
				data: uniqByDataReports.map(item => {

					let currentEles = isEmpty(uniqByKey) ? A([item]) : ele.dataReports.filterBy(uniqByKey, item.name),

						// 	currentEles.resuce((acc, cur) => {
						// 	return acc +cur.report.sales
						// },0)
						productId = isEmpty(item.goodsConfig) ? '' : item.goodsConfig.get('productConfig.product.id'),
						value = currentEles.reduce((acc, cur) => acc + cur.report.sales, 0);

					return {
						// value: item.report.sales,
						value: Number(value.toFixed(0)),
						name: item.name,
						productId
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
					// achi += sReport.report.quotaAchievement;
				});
				achi = currentSales / Quota * 100;
				total.sales.push(Number(currentSales.toFixed(0)));
				total.salesQuota.push(Number(Quota.toFixed(0)));
				total.quotaAchievement.push(Number(achi.toFixed(0)));
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
	/**
	 * @param  {} dataReports
	 * @param  {String} key 筛选的 key
	 * @param  {String} value 与 key 对应的哪个 value
	 * @return {Array} 符合 filterBy 的 item
	 */
	findCurrentItem(dataReports, key, value) {
		if (isEmpty(value)) {
			return dataReports;
		}
		return dataReports.filterBy(key, value);
	},
	/**
	 * @param  {Array} originTrendData 原图表数据
	 * @param  {} formatReport
	 * @param  {} findItemKey
	 * @param  {} findItemValue
	 * @param  {} findProdKey=''
	 * @param  {} findProdValue=''
	 */
	changeTrendData(originTrendData, formatReport, findItemKey, findItemValue, findProdKey = '', findProdValue = '') {
		return originTrendData.map(ele => {
			let total = {
				sales: A([]),
				salesQuota: A([]),
				quotaAchievement: A([])
			};

			formatReport.forEach(item => {
				let currentTotal = EmberObject.create({
						sales: 0,
						salesQuota: 0
					}),
					currentItem = this.findCurrentItem(item.dataReports, findItemKey, findItemValue),
					currentItemByProd = this.findCurrentItem(currentItem, findProdKey, findProdValue);


				currentItemByProd.reduce((acc, current) => {
					acc.sales += current.report.sales;
					acc.salesQuota += current.report.salesQuota;
					return acc;
				}, currentTotal);

				total.sales.push(Number(currentTotal.sales.toFixed(0)));
				total.salesQuota.push(Number(currentTotal.salesQuota.toFixed(0)));
				total.quotaAchievement.push(Number((currentTotal.sales / currentTotal.salesQuota * 100).toFixed(0)));
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
	generateHospitalTableData(destConfigHospitals, lastSeasonReports, formatHospitalSalesReports, productId = '') {
		let total = { salesQuota: 0, sales: 0 },
			totalValue = lastSeasonReports.reduce((acc, current) => {
				acc.salesQuota += current.report.salesQuota;
				acc.sales += current.report.sales;
				return acc;
			}, total);

		return destConfigHospitals.map(ele => {
			let currentItems = this.findCurrentItem(lastSeasonReports, 'hospital.name', ele.get('hospitalConfig.hospital.name')),
				currentItemsByProds = this.findCurrentItem(currentItems, 'goodsConfig.productConfig.product.id', productId),
				currentValue = EmberObject.create({
					patientCount: 0,
					quotaContribute: 0,
					quotaGrowth: 0,
					quotaAchievement: 0,
					salesYearOnYear: 0,
					salesMonthOnMonth: 0,
					salesContribute: 0,
					ytdSales: 0,
					drugEntranceInfo: '',
					representative: ''
				}),
				currentItemReport = currentItemsByProds.reduce((acc, current) => {
					acc.patientCount += Number(current.report.patientCount);
					acc.quotaContribute += current.report.quotaContribute;
					acc.quotaGrowth += current.report.quotaGrowth;
					acc.quotaAchievement += current.report.quotaAchievement;
					acc.salesYearOnYear += current.report.salesYearOnYear;
					acc.salesMonthOnMonth += current.report.salesMonthOnMonth;
					acc.salesContribute += current.report.salesContribute;
					acc.ytdSales += current.report.ytdSales;
					acc.drugEntranceInfo = current.report.drugEntranceInfo;

					return acc;
				}, currentValue),
				currentItemsByProdsUniqBy = currentItemsByProds.uniqBy('goodsConfig.productConfig.treatmentArea'),
				currentItemTotalSeason = formatHospitalSalesReports.map(item => {
					let currentSeason = this.findCurrentItem(item.dataReports, 'hospital.id', ele.get('hospitalConfig.hospital.id')),
						currentSeasonByProds = this.findCurrentItem(currentSeason, 'goodsConfig.productConfig.product.id', productId),
						values = EmberObject.create({
							salesQuota: 0,
							sales: 0
						});
					// currentSeasonByProdsByHosp = currentSeasonByProds.filterBy('hospital.id', ele.get('hospitalConfig.hospital.id'));

					return currentSeasonByProds.reduce((acc, current) => {
						acc.salesQuota += current.report.salesQuota;
						acc.sales += current.report.sales;
						return acc;
					}, values);
				}),
				result = A([]),
				rates = this.calculcateRate(currentItemTotalSeason, totalValue, currentItemReport, productId);

			currentItemReport.patientCount = currentItemsByProdsUniqBy.reduce((acc, cur) => acc + Number(cur.report.patientCount), 0);
			result = [
				ele.get('hospitalConfig.hospital.name'),
				currentItemsByProds.firstObject.resourceConfig.get('representativeConfig.representative.name'),
				this.formatThousand(currentItemReport.patientCount, '', 0),
				isEmpty(productId) ? '-' : currentItemReport.drugEntranceInfo,
				rates.quotaContribute,
				rates.quotaGrowth,
				rates.quotaAchievement,
				rates.salesYearOnYear,
				rates.salesMonthOnMonth,
				rates.salesContribute,
				this.formatThousand(currentItemReport.ytdSales, '￥')

			];
			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.salesQuota, '￥')));
			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.sales, '￥')));
			return result;
		});
	},
	generateRegionTableData(cities, lastSeasonReports, formatCitySalesReports, productId = '') {
		let total = { salesQuota: 0, sales: 0 },
			totalValue = lastSeasonReports.reduce((acc, current) => {
				acc.salesQuota += current.report.salesQuota;
				acc.sales += current.report.sales;
				return acc;
			}, total);

		return cities.map(ele => {
			let currentItems = this.findCurrentItem(lastSeasonReports, 'name', ele.get('name')),
				currentItemsByProds = this.findCurrentItem(currentItems, 'productId', productId),
				currentValue = EmberObject.create({
					patientCount: 0,
					quotaContribute: 0,
					quotaGrowth: 0,
					quotaAchievement: 0,
					salesYearOnYear: 0,
					salesMonthOnMonth: 0,
					salesContribute: 0,
					ytdSales: 0
				}),
				currentItemReport = currentItemsByProds.reduce((acc, current) => {

					acc.patientCount += Number(current.report.patientCount);
					acc.quotaContribute += current.report.quotaContribute;
					acc.quotaGrowth += current.report.quotaGrowth;
					acc.quotaAchievement += current.report.quotaAchievement;
					acc.salesYearOnYear += current.report.salesYearOnYear;
					acc.salesMonthOnMonth += current.report.salesMonthOnMonth;
					acc.salesContribute += current.report.salesContribute;
					acc.ytdSales += current.report.ytdSales;
					return acc;
				}, currentValue),
				currentItemsByProdsUniqBy = currentItemsByProds.uniqBy('goodsConfig.productConfig.treatmentArea'),

				currentItemTotalSeason = formatCitySalesReports.map(item => {
					let currentSeason = this.findCurrentItem(item.dataReports, 'city.name', ele.get('name')),
						currentSeasonByProds = this.findCurrentItem(currentSeason, 'goodsConfig.productConfig.product.id', productId),
						values = EmberObject.create({
							salesQuota: 0,
							sales: 0
						});

					// currentSeasonByProdsByCity = currentSeasonByProds.filterBy('city.name', ele.get('name'));
					return currentSeasonByProds.reduce((acc, current) => {
						acc.salesQuota += current.report.salesQuota;
						acc.sales += current.report.sales;
						return acc;
					}, values);
				}),
				result = A([]),
				rates = this.calculcateRate(currentItemTotalSeason, totalValue, currentItemReport, productId);

			currentItemReport.patientCount = currentItemsByProdsUniqBy.reduce((acc, cur) => acc + Number(cur.report.patientCount), 0);

			result = [
				ele.get('name'),
				this.formatThousand(currentItemReport.patientCount, '', 0),
				rates.quotaContribute,
				rates.quotaGrowth,
				rates.quotaAchievement,
				rates.salesYearOnYear,
				rates.salesMonthOnMonth,
				rates.salesContribute,
				this.formatThousand(currentItemReport.ytdSales, '￥')
			];

			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.salesQuota, '￥')));
			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.sales, '￥')));
			return result;
		});
	},
	generateRepTableData(resourceConfigRepresentatives, lastSeasonReports, formatRepresentativeSalesReports, productId = '') {
		let total = { salesQuota: 0, sales: 0 },
			totalValue = lastSeasonReports.reduce((acc, current) => {
				acc.salesQuota += current.report.salesQuota;
				acc.sales += current.report.sales;
				return acc;
			}, total);

		return resourceConfigRepresentatives.map(ele => {
			let currentItems = this.findCurrentItem(lastSeasonReports, 'representative.name', ele.get('representativeConfig.representative.name')),
				currentItemsByProds = this.findCurrentItem(currentItems, 'goodsConfig.productConfig.product.id', productId),
				currentRepValue = EmberObject.create({
					patientCount: 0,
					quotaContribute: 0,
					quotaGrowth: 0,
					quotaAchievement: 0,
					salesYearOnYear: 0,
					salesMonthOnMonth: 0,
					salesContribute: 0,
					ytdSales: 0
				}),
				currentItemsByProdsUniqBy = currentItemsByProds.uniqBy('goodsConfig.productConfig.treatmentArea'),
				currentItemReport = currentItemsByProds.reduce((acc, current) => {

					acc.patientCount += Number(current.report.patientCount);
					acc.quotaContribute += current.report.quotaContribute;
					acc.quotaGrowth += current.report.quotaGrowth;
					acc.quotaAchievement += current.report.quotaAchievement;
					acc.salesYearOnYear += current.report.salesYearOnYear;
					acc.salesMonthOnMonth += current.report.salesMonthOnMonth;
					acc.salesContribute += current.report.salesContribute;
					acc.ytdSales += current.report.ytdSales;
					return acc;
				}, currentRepValue),

				currentItemTotalSeason = formatRepresentativeSalesReports.map(item => {
					let currentSeason = this.findCurrentItem(item.dataReports, 'representative.id', ele.get('representativeConfig.representative.id')),
						currentSeasonByProds = this.findCurrentItem(currentSeason, 'goodsConfig.productConfig.product.id', productId),
						values = EmberObject.create({
							salesQuota: 0,
							sales: 0
						});

					return currentSeasonByProds.reduce((acc, current) => {
						acc.salesQuota += current.report.salesQuota;
						acc.sales += current.report.sales;
						return acc;
					}, values);
				}),
				result = A([]),
				rates = this.calculcateRate(currentItemTotalSeason, totalValue, currentItemReport, productId);

			currentItemReport.patientCount = currentItemsByProdsUniqBy.reduce((acc, cur) => acc + Number(cur.report.patientCount), 0);

			result = [
				ele.get('representativeConfig.representative.name'),
				this.formatThousand(currentItemReport.patientCount, '', 0),
				rates.quotaContribute,
				rates.quotaGrowth,
				rates.quotaAchievement,
				rates.salesYearOnYear,
				rates.salesMonthOnMonth,
				rates.salesContribute,
				this.formatThousand(currentItemReport.ytdSales, '￥')

			];
			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.salesQuota, '￥')));
			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.sales, '￥')));
			return result;
		});
	},
	calculcateRate(currentItemTotalSeason, totalValue, currentItemReport, productId) {
		let seasonLength = currentItemTotalSeason.length,
			lastSeasonTotalData = currentItemTotalSeason.lastObject,
			quotaContribute = isEmpty(productId) ? this.formatPercent(lastSeasonTotalData.salesQuota / totalValue.salesQuota) : this.formatPercent(currentItemReport.quotaContribute),
			quotaGrowth = isEmpty(productId) ? this.formatPercent(lastSeasonTotalData.salesQuota / currentItemTotalSeason[seasonLength - 2].sales - 1) : this.formatPercent(currentItemReport.quotaGrowth),
			quotaAchievement = isEmpty(productId) ? this.formatPercent(lastSeasonTotalData.sales / lastSeasonTotalData.salesQuota) : this.formatPercent(currentItemReport.quotaAchievement),
			salesYearOnYear = 0,
			// salesYearOnYear = isEmpty(productId) ? this.formatPercent(lastSeasonTotalData.sales / currentItemTotalSeason[seasonLength - 5].sales - 1) : this.formatPercent(currentItemReport.salesYearOnYear),
			salesMonthOnMonth = isEmpty(productId) ? this.formatPercent(lastSeasonTotalData.sales / currentItemTotalSeason[seasonLength - 2].sales - 1) : this.formatPercent(currentItemReport.salesMonthOnMonth),
			salesContribute = isEmpty(productId) ? this.formatPercent(lastSeasonTotalData.sales / totalValue.sales) : this.formatPercent(currentItemReport.salesContribute);

		if (seasonLength > 4) {
			salesYearOnYear = isEmpty(productId) ? this.formatPercent(lastSeasonTotalData.sales / currentItemTotalSeason[seasonLength - 5].sales - 1) : this.formatPercent(currentItemReport.salesYearOnYear);
		}
		return {
			quotaContribute,
			quotaGrowth,
			quotaAchievement,
			salesYearOnYear,
			salesMonthOnMonth,
			salesContribute
		};
	}
});
