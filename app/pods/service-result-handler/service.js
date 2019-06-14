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
						productId = isEmpty(item.goodsConfig) ? '' : item.goodsConfig.get('productConfig.product.id');

					return {
						// value: item.report.sales,
						value: currentEles.reduce((acc, cur) => {
							return acc + cur.report.sales;
						}, 0),
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
				achi = currentSales / Quota;
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

				total.sales.push(currentTotal.sales);
				total.salesQuota.push(currentTotal.salesQuota);
				total.quotaAchievement.push(Number((currentTotal.sales / currentTotal.salesQuota).toFixed(2)));
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
		return destConfigHospitals.map(ele => {

			let currentItems = this.findCurrentItem(lastSeasonReports, 'hospital.id', ele.get('hospitalConfig.hospital.id')),
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
				currentItemTotalSeason = formatHospitalSalesReports.map(item => {
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
				result = A([]);

			result = [
				ele.get('hospitalConfig.hospital.name'),
				currentItemsByProds.firstObject.resourceConfig.get('representativeConfig.representative.name'),
				this.formatThousand(currentItemReport.patientCount, '', 0),
				currentItemReport.drugEntranceInfo,
				this.formatPercent(currentItemReport.quotaContribute),
				this.formatPercent(currentItemReport.quotaGrowth),
				this.formatPercent(currentItemReport.quotaAchievement),
				this.formatPercent(currentItemReport.salesYearOnYear),
				this.formatPercent(currentItemReport.salesMonthOnMonth),
				this.formatPercent(currentItemReport.salesContribute),
				this.formatThousand(currentItemReport.ytdSales, '￥')

			];
			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.salesQuota, '￥')));
			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.sales, '￥')));
			return result;
		});
	},
	generateRegionTableData(cities, lastSeasonReports, formatCitySalesReports, productId = '') {
		return cities.map(ele => {
			let currentItems = this.findCurrentItem(lastSeasonReports, 'city.id', ele.get('id')),
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

				currentItemTotalSeason = formatCitySalesReports.map(item => {
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
				result = A([]);

			result = [
				ele.get('name'),
				this.formatThousand(currentItemReport.patientCount, '', 0),
				this.formatPercent(currentItemReport.quotaContribute),
				this.formatPercent(currentItemReport.quotaGrowth),
				this.formatPercent(currentItemReport.quotaAchievement),
				this.formatPercent(currentItemReport.salesYearOnYear),
				this.formatPercent(currentItemReport.salesMonthOnMonth),
				this.formatPercent(currentItemReport.salesContribute),
				this.formatThousand(currentItemReport.ytdSales, '￥')

			];
			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.salesQuota, '￥')));
			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.sales, '￥')));
			return result;
		});
	},
	generateRepTableData(resourceConfigRepresentatives, lastSeasonReports, formatRepresentativeSalesReports, productId = '') {
		return resourceConfigRepresentatives.map(ele => {
			let currentItems = this.findCurrentItem(lastSeasonReports, 'representative.id', ele.get('representativeConfig.representative.id')),
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
				result = A([]);

			result = [
				ele.get('representativeConfig.representative.name'),
				this.formatThousand(currentItemReport.patientCount, '', 0),
				this.formatPercent(currentItemReport.quotaContribute),
				this.formatPercent(currentItemReport.quotaGrowth),
				this.formatPercent(currentItemReport.quotaAchievement),
				this.formatPercent(currentItemReport.salesYearOnYear),
				this.formatPercent(currentItemReport.salesMonthOnMonth),
				this.formatPercent(currentItemReport.salesContribute),
				this.formatThousand(currentItemReport.ytdSales, '￥')

			];
			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.salesQuota, '￥')));
			result.push(...currentItemTotalSeason.map(item => this.formatThousand(item.sales, '￥')));
			return result;
		});
	}
});
