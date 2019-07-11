import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
// import { isEmpty } from '@ember/utils';
// import { all, reject } from 'rsvp';
// import { A } from '@ember/array';

export default Controller.extend({
	// axios: service(),
	ajax: service(),
	cookies: service(),
	level: computed('model', function () {
		let model = this.model,
			code = model.get('assessmentReports.lastObject.simplifyResult.levelConfig.level.code');

		switch (true) {
		case code === 1:
			return 'S级';
		case code === 2:
			return 'A级';
		case code === 3:
			return 'B级';
		default:
			return '未知级别';
		}
	}),
	isHistory: null,
	actions: {
		checkResult() {
			this.transitionToRoute('page-result', this.model.id);
		},
		outputData(type) {
			const applicationAdapter = this.store.adapterFor('application'),
				{ ajax } = this;

			let version = `${applicationAdapter.get('namespace')}`;
			// fileNames = A([]),
			// proposalId = localStorage.getItem('proposalId');

			ajax.request(`${version}/GenerateCSV`, {
				method: 'POST',
				data: JSON.stringify({
					// 'proposal-id': proposalId,
					'paper-id': this.model.id,
					'account-id': this.get('cookies').read('account_id'),
					// 'scenario-id': this.model.scenario.get('id'),
					'download-type': type
				})
			});
			// .then(data => {
			// 	if (data.status !== 'ok' || isEmpty(data.fileNames)) {
			// 		return reject();
			// 	}
			// 	fileNames = data.fileNames;
			// 	return all(fileNames.map(ele => {
			// 		return axios.axios({
			// 			url: `${ele}`,
			// 			method: 'get',
			// 			responseType: 'blob'
			// 		});
			// 	}));
			// }).then(data => {
			// 	data.forEach((res, index) => {
			// 		const content = res.data,
			// 			blob = new Blob([content], { type: 'text/csv' }),
			// 			fileName = fileNames[index];

			// 		if ('download' in document.createElement('a')) { // 非IE下载
			// 			const elink = document.createElement('a');

			// 			elink.download = fileName;
			// 			elink.style.display = 'none';
			// 			elink.href = URL.createObjectURL(blob);
			// 			document.body.appendChild(elink);
			// 			elink.click();
			// 			URL.revokeObjectURL(elink.href); // 释放URL 对象
			// 			document.body.removeChild(elink);
			// 		} else { // IE10+下载
			// 			navigator.msSaveBlob(blob, fileName);
			// 		}
			// 	});
			// }).catch(() => {
			// });
		}
	}
});
