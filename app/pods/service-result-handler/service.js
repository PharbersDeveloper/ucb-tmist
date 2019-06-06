import Service from '@ember/service';
import { htmlSafe } from '@ember/template';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Service.extend({
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
				seriesName: ele.season + '销售额',
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
	findCurrentItem(dataReports, key, value) {
		return dataReports.findBy(key, value);
	},
	changeTrendData(originTrendData, formatReport, findItemKey, findItemValue) {
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
				let currentItem = this.findCurrentItem(item.dataReports, findItemKey, findItemValue);

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
	}
});
