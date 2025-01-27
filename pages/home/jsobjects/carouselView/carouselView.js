export default {
	pageParam: {},
	currentIndex: 0,
	carouselItems: [],
	habits: {},
	timer: {
		updateDataTimer: "",
		updateHabitDataTimer: "",
		displayTimer: ""
	},
	// 检查是否过期的函数
	isExpired(targetTime) {
		const now = new Date(); // 获取当前时间
		return now > targetTime; // 当前时间是否大于目标时间
	},
	reverseString(str) {
		let reversedStr = '';
		for (let i = str.length - 1; i >= 0; i--) {
			reversedStr += str[i];
		}
		return reversedStr;
	},
	encrypt(content) {
		const encodeUint8Array = Uint8Array.from(Array.from(content).map(letter => letter.charCodeAt(0)));
		let encodeBase64 = encodeUint8Array.toBase64()
		let enencodeBase64 = this.reverseString(encodeBase64)
		return enencodeBase64;
	},
	decrypt(content) {
		let dedecodeBase64 = this.reverseString(content)
		const decodeUint8Array = Uint8Array.fromBase64(dedecodeBase64);
		var encodeStr = String.fromCharCode.apply(null, decodeUint8Array);
		return encodeStr;
	},
	startTimer(timer, ms) {
		var self = this
		if (timer == 'updateData') {
			console.error("updateDataTimer:", this.timer.updateDataTimer)
			if (this.timer.updateDataTimer)	clearTimeout(this.timer.updateDataTimer)

			this.timer.updateDataTimer = setTimeout(()=>self.updateCarouselItemData(), ms * 1000)
		} else if (timer == 'updateHabitData') {
			console.error("updateHabitDataTimer:", this.timer.updateHabitDataTimer)
			if (this.timer.updateHabitDataTimer) clearTimeout(this.timer.updateHabitDataTimer)

			this.timer.updateHabitDataTimer = setTimeout(()=>self.updateHabitsByCarouselId(), ms * 1000)
		} else if (timer == 'display') {
			console.error("displayTimer:", this.timer.displayTimer)
			if (this.timer.displayTimer) clearTimeout(this.timer.displayTimer)

			this.timer.displayTimer = setTimeout(()=>self.displayCarousel(), ms * 1000)
		} 
	},
	testComposess: async () => {
		// 获取当前时间
		const currentTime = new Date();
		// 计算过期时间（加 1 小时）
		const expirationTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
		var obj = { 'uId': 1, 'cId': 1, 'expTime': expirationTime}

		let jsonStr = JSON.stringify(obj)
		console.log("json string:", jsonStr)
		let encode = this.encrypt(jsonStr)
		console.log("encode: ", encode)
		return encode
	},
	leftButtonAction() {
		let index = this.currentIndex - 1;
		if (index < 0) {
			index = this.carouselItems.length - 1;
		}
		index --
		if (index < 0) {
			index = this.carouselItems.length - 1;
		}
		this.currentIndex = index
		this.displayCarousel()
	},
	rightButtonAction() {
		this.displayCarousel()
	},
	displayCarousel () {
		if (this.isExpired(this.pageParam.expTime)){
			console.log("链接已经过期")
			showAlert("链接已经过期！", "warning")
			return;
		}

		if (!this.carouselItems || this.carouselItems.length == 0){
			console.log("轮播中没有任何可显示的轮播项！")
			WarnningText.setText("轮播中没有任何可显示的轮播项！")
			WarnningText.setTextColor("red")
			setTimeout(()=>self.displayCarousel(), 5 * 1000) // 5秒刷新，因为会不断的更新carouselItems对象
			return;
		}
		WarnningText.setText("预览")
		WarnningText.setTextColor("black")

		if (this.currentIndex >= this.carouselItems.length) {
			this.currentIndex = 0
		}

		var currentItem = this.carouselItems[this.currentIndex]
		OrderText.setText(currentItem.order+"号")

		// 1: image, 2: remind, 3: habit, 4: long_schedule
		let type = "提醒"
		if (currentItem.type == 1) {
			type = '图片'
		} else if (currentItem.type == 2) {
			type = '提醒'
		} else if (currentItem.type == 3) {
			type = '习惯'
			if(this.habits.hasOwnProperty('h' + currentItem.relations_id)) {
				let habit = this.habits['h' + currentItem.relations_id]
				console.log(habit)
				RelationsIdText.setText(habit.prompt);
			} else {
				RelationsIdText.setText('--');
			}
		} else if (currentItem.type == 4) {
			type = '长日程'
		}
		PageTypeText.setText(type)

		// 1: permanent, 2: remind, 3: random
		let displayType = "提醒"
		if (currentItem.display_type == 1) {
			displayType = "常驻"
		} else if (currentItem.display_type == 2) {
			displayType = "提醒" 
		} else if (currentItem.display_type == 3) {
			displayType = "随机" 
		}
		DisplayTypeText.setText(displayType)

		let alertLevel = "--"
		if (currentItem.alert_level == 1) {
			alertLevel = "前景闪烁"
		} else if (currentItem.alert_level == 2) {
			alertLevel = "背景闪烁"
		}else if (currentItem.alert_level == 3) {
			alertLevel = "高频率"
		}
		AlertLevelText.setText(alertLevel)

		if (currentItem.duration) {
			DurationText.setText(currentItem.duration + "秒")
		} else {
			DurationText.setText("-秒")
		}
		Image.setImage(currentItem.chart_url)

		TriggerTimeText.setText(currentItem.trigger_time);
		let cron = cron_schedule.parseCronExpression(currentItem.trigger_time)
		let nextTriggerTime = cron.getNextDate(new Date())
		console.log("nextTriggerTime type ", typeof nextTriggerTime, nextTriggerTime)

		var timezoneOffset = nextTriggerTime.getTimezoneOffset(); // 获取设备时区与 UTC 时间的偏移量（以分钟为单位）

		console.log("timezoneOffset: " + timezoneOffset)
		// 将偏移量应用于日期时间，以转换为设备所在时区的时间
		nextTriggerTime.setMinutes(nextTriggerTime.getMinutes() - timezoneOffset);
		console.log("moment.format() ", moment(nextTriggerTime).format("YYYY/MM/DD hh:mm:ss"))
		NextTriggerTimeText.setText(moment(nextTriggerTime).format("YYYY/MM/DD hh:mm:ss"))

		this.currentIndex ++

		// 定时更新数据
		let duration = 5
		if (currentItem.duration) {
			duration = currentItem.duration
		}
		this.startTimer("display", duration)
	},
	async updateHabitsByCarouselId() {
		if (this.isExpired(this.pageParam.expTime)){
			console.log("链接已经过期")
			showAlert("链接已经过期！", "warning")
			return;
		}

		const ownerId = this.pageParam.uId
		await findHabitsByCarouselId.run({'ownerId': ownerId})

		let data = findHabitsByCarouselId.data
		let time = 10; // 默认情况下为10秒钟刷新
		if(data && data.length > 0) {
			time = 60 * 5; // 如果有东西则每5分钟刷新
			this.habits = {}
			for (let i = 0; i < data.length; i++) {
				var item = data[i]
				this.habits['h' + i] = item
			}
		}

		// 定时更新数据
		this.startTimer("updateHabitData", time)
	},
	async updateCarouselItemData() {
		if (this.isExpired(this.pageParam.expTime)){
			console.log("链接已经过期")
			showAlert("链接已经过期！", "warning")
			return;
		}

		const carouselId = this.pageParam.cId
		await findCarouselItemByCarouseId.run({'id': carouselId})

		// console.log("加载轮播失败", JSON.stringify(err))
		// showAlert("加载轮播失败" + JSON.stringify(err),"warning")

		let data = findCarouselItemByCarouseId.data

		let time = 10; // 默认情况下为10秒钟刷新
		if(data && data.length > 0) {
			time = 60 * 5; // 如果有东西则每5分钟刷新
		}

		this.carouselItems = data
		this.displayCarousel()

		// 定时更新数据
		this.startTimer("updateData", time)
	},
	async onload () {
		console.log("url query params:", appsmith.URL.queryParams)

		// var param = await this.testComposess()
		var param = appsmith.URL.queryParams['param']
		if (!param){
			console.log("没找到参数，所以，不能给用户查看")
			showAlert("链接已经过期！", "warning")
			return;
		}
		console.log("encode: ", param)
		let decode = await this.decrypt(param)
		console.log("decode: ", decode)
		this.pageParam = JSON.parse(decode)

		if (this.isExpired(this.pageParam.expTime)){
			console.log("链接已经过期")
			showAlert("链接已经过期！", "warning")
			return;
		}

		await this.updateHabitsByCarouselId()

		await this.updateCarouselItemData()
		await this.displayCarousel()
	}
}