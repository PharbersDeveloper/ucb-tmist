import Transform from 'ember-data/transform';

export default Transform.extend({
	deserialize(serialized) {
		let date = new Date(serialized),
			Y = date.getFullYear() + '-',
			M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-',
			D = (date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()) + ' ',
			h = (date.getHours() + 1 < 10 ? '0' + (date.getHours() + 1) : date.getHours() + 1) + ':',
			m = (date.getMinutes() + 1 < 10 ? '0' + (date.getMinutes() + 1) : date.getMinutes() + 1) + ':',
			s = (date.getSeconds() + 1 < 10 ? '0' + (date.getSeconds() + 1) : date.getSeconds() + 1);

		// 输出结果：yyyy-mm-dd hh:mm:ss
		return Y + M + D + h + m + s;
	},

	serialize(deserialized) {
		return new Date(deserialized).getTime();
	}
});
