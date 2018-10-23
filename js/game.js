$(function() {
	//生成初始牌堆
	let all_poker = []; //初始总牌组

	//初始化用户数据
	let player1 = {
		name: 'a',
		integral: 1000,
		poker: [],
		role: 0
	};
	let player2 = {
		name: 'b',
		integral: 1000,
		poker: [],
		role: 0
	};
	let player3 = {
		name: 'c',
		integral: 1000,
		poker: [],
		role: 0
	};
	let player = [player1, player2, player3];
	//除王以外的牌、花色1-4、数字1-13
	for(let i = 1; i <= 13; i++) {
		for(let j = 1; j <= 4; j++) {
			all_poker.push({
				suit: j,
				num: i
			});
		}
	}
	//存储当前对局的相关信息
	let game = {
		boss: null, //这局的地主
		selected_poker: {
			type: 0,
			max: 0,
			poker: []
		}, //选择的手牌
		desktop_poker: {
			type: 0,
			max: 0,
			poker: []
		}, //桌面上的牌
		timer: null, //定时器
		first_game:true,//判断是不是第一场游戏，用于取消开场动画
		mul:15 //计算倍数
	}

	all_poker.push({ //小王
		suit: 1,
		num: 14
	});
	all_poker.push({ //大王
		suit: 2,
		num: 14
	});

	// 从 sessionStorage 对象中取出数据  
	getStorage();

	//玩家初始积分
	$('.p1_integral').html(player1.integral);
	$('.p2_integral').html(player2.integral);
	$('.p3_integral').html(player3.integral);

	//开场动画
	if(game.first_game) {
		startAnimate();
	}

	function startAnimate() {
		//显示开场zzc
		$('.start_zzc').css('display','block');
		let tmp = '<video class="vid" src="./img/happy.mp4"  autoplay loop width="1920" height="990" style="display:block; position:absolute; z-index: 2100;" ></video>';
		$('body').append(tmp);
		$('.vid').click(function() {
			$(".vid").animate({
				'opacity': '0'
			}, 1000);
			$('.parent').show();
			setTimeout(function() {
				$('.vid').hide().attr('src', '');
			}, 1000)
		})

		$('.start_zzc').fadeOut(3000);
		$('.startBtn').click(function() {
			$(".d1").animate({
				'left': '-100%'
			}, 1500);
			$(".d2").animate({
				'right': '-100%'
			}, 1500);
			setTimeout(function(){
				$('.parent').hide();
			},1500)
			$('.startBtn').css('display', 'none');
			$('.start_zzc').css('display', 'none');
		})
	}
	//所有牌对应的li元素
	let poker_str = '';
	for(let i = 0; i < 54; i++) {
		poker_str += '<li class="back" style="top:' + -i + 'px;"></li>';
	}
	$('.all_poker').append(poker_str);

	//绑定洗牌跟发牌事件
	$('body').on('click', '.xipai', function() {
		clearPoker();
		$('.xipai').css({
			display: 'none'
		});
		$('.bg-music').attr('src', './music/beiJing.mp3');
		setTimeout(function() {
			$('.fapai').css({
				display: 'block'
			})
		}, 10000)
	});
	$('body').on('click', '.fapai', function() {
		deal();
		$('.fapai').css({
			display: 'none'
		});
		//添加发牌音效
		$('.loop-music').attr('src', './music/faPai.mp3');
		setTimeout(function() {
			//取消发牌音效
			$('.loop-music').attr('src', '');
		}, 5800);
	});

	//封装洗牌函数
	function clearPoker() {
		//打乱总牌组数据
		for(let i = 0; i < 3; i++) {
			all_poker.sort(function() {
				return Math.random() - 0.5;
			});
		}
		//删除原始牌堆
		let $all = $('.all_poker');
		$all.remove();
		let tmp = '';
		for(let i = 0; i < 54; i++) {
			tmp += '<ul class="all_poker" style="top: -' + i * 275 + 'px">';

			tmp += '<li class="back" style="top: -' + i + 'px;"></li>'

			tmp += '</ul>'
		}
		$('.mid_top').append(tmp);

		//洗牌动画
		for(let i = 0; i < 54; i++) {
			if(i % 2 == 0) {
				setTimeout(function() {
					$('.all_poker').eq(i).animate({
						left: '-500px'
					}, 100).css({
						'transform': 'rotateX(180deg) rotateZ(-900deg) translate(20px, 300px)',
						'transition': 'linear 2s'
					})
				}, 80 * i)

				setTimeout(function() {
					$('.all_poker').eq(i).animate({
						left: '0px'
					}, 200).css({
						'transform': 'rotateX(360deg) rotateZ(1080deg) translate(0px, 0px)',
						'transition': 'linear 3s'
					})
				}, 6000 + i * 10)

			} else {
				setTimeout(function() {
					$('.all_poker').eq(i).animate({
						left: '500px'
					}, 100).css({
						'transform': 'rotateX(180deg) rotateZ(900deg) translate(20px, 300px)',
						'transition': 'linear 2s'
					})
				}, 80 * i)
				setTimeout(function() {
					$('.all_poker').eq(i).animate({
						left: '0px'
					}, 200).css({
						'transform': 'rotateX(360deg) rotateZ(-1080deg) translate(0px, 0px)',
						'transition': 'linear 3s'
					})
				}, 6000 + i * 10)
			}
		}

		//动画结束三个牌堆合并
		setTimeout(function() {
			$('.all_poker').remove();
			$('.mid_top').html($all);
		}, 10000);
	}

	//封装发牌函数
	let poker_data; //单张牌的数据对象
	let poker_tmp = ''; //保存牌面li的临时html
	function deal(num) {
		num = num || 0;
		if(num < 17) {
			//发牌给第一个玩家
			$('.all_poker li:last').animate({
				left: '-500px',
				top: '300px'
			}, 100);
			setTimeout(function() {
				$('.all_poker li:last').remove();
				player1.poker.push(all_poker.pop());
				poker_data = player1.poker[player1.poker.length - 1];
				poker_tmp = getFrontPoker(poker_data);
				$('.play_1').append(poker_tmp);
				$('.play_1 li:last').css({
					top: num * 26 + 'px'
				});
			}, 100);
			//发牌给第二个玩家
			setTimeout(function() {
				$('.all_poker li:last').animate({
					left: '0px',
					top: '600px'
				}, 100);
			}, 110);
			setTimeout(function() {
				$('.all_poker li:last').remove();
				player2.poker.push(all_poker.pop());
				poker_data = player2.poker[player2.poker.length - 1];
				poker_tmp = getFrontPoker(poker_data);
				$('.play_2').append(poker_tmp).css({
					left: -num * 15 + 'px'
				});
				$('.play_2 li:last').css({
					left: num * 30 + 'px'
				});
			}, 210);
			//发牌给第三个玩家
			setTimeout(function() {
				$('.all_poker li:last').animate({
					left: '500px',
					top: '300px'
				}, 100);
			}, 220);
			setTimeout(function() {
				$('.all_poker li:last').remove();
				player3.poker.push(all_poker.pop());
				poker_data = player3.poker[player3.poker.length - 1];
				poker_tmp = getFrontPoker(poker_data);
				$('.play_3').append(poker_tmp);
				$('.play_3 li:last').css({
					top: num * 26 + 'px'
				});
				deal(num + 1);
			}, 330);
		} else {
			$('.all_poker li:last').animate({
				left: '-150px'
			}, 200);
			$('.all_poker li:nth-last-child(2)').animate({
				left: '150px'
			}, 200);
			//旋转牌并在结束时牌排好序
			$('.play_2').css('transform', 'rotateX(90deg)');
			$('.play_1').css('transform', 'rotateY(90deg)');
			$('.play_3').css('transform', 'rotateY(90deg)');
			allPokerSort();
			setTimeout(function() {
				$('.play li').remove();
				for(let i = 0; i < 17; i++) {
					//重新生成玩家2的牌
					poker_data = player2.poker[i];
					poker_tmp = getFrontPoker(poker_data);
					$('.play_2').append(poker_tmp);
					$('.play_2 li:last').css({
						left: 30 * i + 'px'
					});
					//重新生成玩家1的牌
					poker_data = player1.poker[i];
					poker_tmp = getFrontPoker(poker_data);
					$('.play_1').append(poker_tmp);
					$('.play_1 li:last').css({
						top: 26 * i + 'px'
					});
					//重新生成玩家3的牌
					poker_data = player3.poker[i];
					poker_tmp = getFrontPoker(poker_data);
					$('.play_3').append(poker_tmp);
					$('.play_3 li:last').css({
						top: 26 * i + 'px'
					});
				}
				$('.play_2').css('transform', 'rotateX(0deg)');
				$('.play_1').css('transform', 'rotateY(0deg)');
				$('.play_3').css('transform', 'rotateY(0deg)');
				//开始抢地主
				setTimeout(function() {
					getBoss();
				}, 1000);
			}, 1000);
		}
	}

	//返回扑克正面的li字符串
	function getFrontPoker(obj) {
		let suits_arr = [
			[-17, -225], // 方块花色的坐标
			[-17, -5], // 梅花花色的坐标
			[-160, -5], // 红桃花色的坐标
			[-160, -225] // 黑桃花色的坐标
		];

		let tmp;
		let num = obj.num;
		let suit = obj.suit;

		let pos; //背景图坐标x,y
		if(num < 14) {
			pos = suits_arr[suit - 1];
		} else {
			if(suit == 1) {
				pos = [-160, -5];
			} else {
				pos = [-17, -5];
			}
		}
		tmp = '<li style="width: 125px; height: 175px; background: url(./img/' + num + '.png) ' + pos[0] + 'px ' + pos[1] + 'px;" num=' + num + ' suit=' + suit + '></li>';
		return tmp;
	}
	//对三个玩家的牌排序
	function allPokerSort() {
		pokerArrSort(player1.poker);
		pokerArrSort(player2.poker);
		pokerArrSort(player3.poker);
	}
	//对当个指定玩家的牌排序
	function pokerArrSort(arr) {
		arr.sort(function(x, y) {
			if(x.num != y.num) {
				return x.num - y.num;
			} else {
				return x.suit - y.suit;
			}
		});
	}
	//抢地主函数
	function getBoss(candidate, num) {
		candidate = candidate || Math.ceil(Math.random() * 3); //候选地主1,2,3
		//		candidate = candidate || 2; //候选地主1,2,3

		num = num || 0; //记录不抢地主的次数

		countDown(candidate, num); //抢地主时的倒时器

		$('.play_btn').eq(candidate - 1).css('display', 'block');

		//绑定当前按钮的点击事件
		$('.play_btn').eq(candidate - 1).on('click', '.get', function() {
			//把计时器清除
			clearInterval(game.timer);
			$('.time').hide();
			//添加抢地主音乐
			$('.noloop-music').attr('src', './music/qiangDiZhu.mp3');
			//把抢地主的按钮去掉
			$('.play_btn').hide();
			//设置玩家为地主角色
			player[candidate - 1].role = 1;
			game.boss = candidate;

			//确认地主改变头像
			for(let i = 0; i < 3; i++) {
				$('.player div').eq(i).css('background', 'url(./img/nongm.png)');
				if(candidate - 1 == i) {
					$('.player div').eq(candidate - 1).css('background', 'url(./img/dizhu.png)');
				}

			}
			$('.player div').css({
				'display': 'block'
			});
			//抢完地主显示积分
			$('.p1_integral').css('display', 'block');
			$('.p2_integral').css('display', 'block');
			$('.p3_integral').css('display', 'block');
			$('.multiple').css('display', 'block');

			$('.multiple').html((game.mul *= 2));
			//显示地主牌
			$('.all_poker').css('transform', 'rotateX(90deg)');
			setTimeout(function() {
				$('.all_poker li').remove();
				//将地主牌插入地主手牌中
				for(let i = 0; i < 3; i++) {
					poker_data = all_poker[i];
					poker_tmp = getFrontPoker(poker_data);
					$('.all_poker').append(poker_tmp);
					$('.play').eq(candidate - 1).append(poker_tmp);
					if(candidate == 2) {
						$('.play').eq(candidate - 1).find('li:last').css('left', (17 + i) * 30 + 'px');
						$('.play').eq(candidate - 1).css('left', '-285px');
					} else {
						$('.play').eq(candidate - 1).find('li:last').css('top', (17 + i) * 26 + 'px');
					}
					//把地主牌数据放入地主玩家手牌数据中
					player[candidate - 1].poker.push(all_poker[i]);
				}
				$('.all_poker').css('transform', 'rotateX(0deg)');
				$('.all_poker li').eq(0).css('left', '-150px');
				$('.all_poker li').eq(1).css('left', '150px');
				//重新对地主牌排序
				setTimeout(function() {
					//地主牌缩小上移
					$('.all_poker li').eq(0).animate({
						top: '-50px',
						width: '100px',
						height: '140px'
					}, 500);
					$('.all_poker li').eq(1).animate({
						top: '-50px',
						width: '100px',
						height: '140px'
					}, 500);
					$('.all_poker li').eq(2).animate({
						top: '-50px',
						width: '100px',
						height: '140px'
					}, 500);
					if(candidate == 2) {
						$('.play').eq(candidate - 1).css('transform', 'rotateX(90deg)');
					} else {
						$('.play').eq(candidate - 1).css('transform', 'rotateY(90deg)');
					}
					pokerArrSort(player[candidate - 1].poker);
					setTimeout(function() {
						$('.play').eq(candidate - 1).find('li').remove();
						for(let i = 0; i < 20; i++) {
							poker_data = player[candidate - 1].poker[i];
							poker_tmp = getFrontPoker(poker_data);
							$('.play').eq(candidate - 1).append(poker_tmp);
							if(candidate == 2) {
								$('.play').eq(candidate - 1).find('li:last').css('left', i * 30 + 'px');
							} else {
								$('.play').eq(candidate - 1).find('li:last').css('top', i * 26 + 'px');
							}
						}
						if(candidate == 2) {
							$('.play').eq(candidate - 1).css('transform', 'rotateX(0deg)');
						} else {
							$('.play').eq(candidate - 1).css('transform', 'rotateY(0deg)');
						}
						//开始出牌阶段
						playPoker(candidate, 2);
					}, 1000);
				}, 1000);
			}, 500);
		});

		$('.play_btn').eq(candidate - 1).on('click', '.cancel', function() {
			$('.noloop-music').attr('src', './music/buQiang.mp3');
			clearInterval(game.timer);
			num++;
			if(num == 3) { //无人抢地主
				alertMsg('无人抢地主');
			} else {
				$('.play_btn').css('display', 'none');
				$('.time').hide();
				//跳转至下一玩家
				candidate = candidate == 3 ? 1 : candidate + 1;
				getBoss(candidate, num);
			}
		});
	}
	//消息弹窗
	function alertMsg(msg) {
		$('.zzc').show();
		$('.msg_tc').show().on('click', function() {
			saveToStorage();
			window.location.href = window.location.href;
		});
	}
	//开始出牌 index:1-3,cancel_num:连续要不起的次数
	function playPoker(index, cancel_num) { 
		//初始化
		$('.play_btn2').hide();
		$('.play').off('click', 'li');
		$('.play_btn2 .play_out').off('click');
		$('.play_btn2 .pass').off('click');
		$('.play_btn2 .hint').off('click');
		//先显示出牌玩家对应的按钮组
		$('.play_btn2').eq(index - 1).css('display', 'block');
		//未选牌前不允许点击出牌按钮
		$('.play_btn2 .play_out').attr('disabled', true);
		overTime(index, cancel_num); //定时器
		//若pass两次则清空桌上的牌
		if(cancel_num == 2) {
			cancel_num = 0;
			game.desktop_poker.poker.splice(0);
			game.desktop_poker.type = 0;
			game.desktop_poker.max = 0;
			//将pass按钮设为不可按
			$('.play_btn2 .pass').attr('disabled', true);
		} else {
			$('.play_btn2 .pass').attr('disabled', false);
		}
		//绑定选牌事件
		$('.play').eq(index - 1).on('click', 'li', function() {
			//获取点击的牌的数据
			//			$('.noloop-music').attr('src','./music/button.mp3');
			let tmp = {};
			tmp.num = $(this).attr('num') * 1;
			tmp.suit = $(this).attr('suit') * 1;
			if($(this).attr('class') == 'selected') {
				//取消选择
				$(this).removeClass('selected');
				delSelected(tmp);
			} else {
				//选择该牌
				$(this).addClass('selected');
				game.selected_poker.poker.push(tmp);
			}
			//判断是否可以出牌
			if(game.selected_poker.poker.length == 0) {
				$('.play_btn2 .play_out').attr('disabled', true);
			} else {
				$('.play_btn2 .play_out').attr('disabled', false);
			}
		});
		//绑定出牌按钮事件 
		$('.play_btn2 .play_out').eq(index - 1).on('click', function() {
			//检查所选牌是否符合出牌规则
			checkPoker(game.selected_poker);

			if(game.selected_poker.type == 0) {
				//不符合规则
				console.log('不符合规则');
			} else if(vsPoker()) { //判断是否能将牌打出去
				//清除计时器
				clearInterval(game.timer);
				$('.time').hide();
				//调用动画函数
				animation();
				//调用音效函数
				autoPlay();
				//玩家手牌数据刷新
				delPlayerPoker(index);
				//将选择手牌数据转移到桌面中
				game.desktop_poker.type = game.selected_poker.type;
				game.desktop_poker.max = game.selected_poker.max;
				game.desktop_poker.poker.splice(0);
				$('.desktop li').remove();
				let selected_len = game.selected_poker.poker.length;
				for(let i = 0; i < selected_len; i++) {
					game.desktop_poker.poker.push(game.selected_poker.poker.shift());
					poker_data = game.desktop_poker.poker[i];
					poker_tmp = getFrontPoker(poker_data);
					$('.desktop').append(poker_tmp);
					$('.desktop li:last').css('left', i * 30 + 'px');
					$('.desktop').css('left', -i * 15 + 'px');
				}

				// 判断牌类型（倍数）
				if(game.selected_poker.type == 99) {
					$('.multiple').html((game.mul *= 2) + '倍');
				} else if(game.selected_poker.type == 110) {
					$('.multiple').html((game.mul *= 2) + '倍');
				}
				//手牌打完游戏结束
				if(player[index - 1].poker.length == 0) {
					setTimeout(function() {
						//结束音效
						$('.noloop-music').attr('src', './music/over.mp3');
						win(index);
					}, 500);
				} else {
					index = index == 3 ? 1 : index + 1;
					playPoker(index, 0);
				}

			} else {
				//压不过桌上的牌
				console.log('压不过桌上的牌');
			}
		});
		//绑定pass按钮事件
		$('.play_btn2 .pass').eq(index - 1).on('click', function() {
			//添加不出音效
			let tmp = './music/pass' + Math.ceil(Math.random() * 3) + '.mp3';
			$('.noloop-music').attr('src', tmp);
			//清除计时器
			clearInterval(game.timer);
			$('.time').hide();
			//清除selected_poker中的数据
			$('.play').eq(index - 1).find('li').removeClass('selected');
			game.selected_poker.poker.splice(0);
			index = index == 3 ? 1 : index + 1;
			playPoker(index, cancel_num + 1);
		});
		//绑定提示按钮事件
		$('.play_btn2 .hint').eq(index - 1).on('click', function() {
			getHint(index);
		});
	}
	//从game.selected_poker.poker中移除obj对应的牌
	function delSelected(obj) {
		for(let i = 0; i < game.selected_poker.poker.length; i++) {
			if(game.selected_poker.poker[i].num == obj.num && game.selected_poker.poker[i].suit == obj.suit) {
				game.selected_poker.poker.splice(i, 1);
				break;
			}
		}
	}
	/*
	 * 检查选中的牌
	 * type代号:
	 * 1：单张
	 * 2：一对
	 * 3：三张
	 * 4：三带一
	 * 5：顺子
	 * 6：连对
	 * 7：飞机
	 * 8：三带二
	 * 9：四带两单
	 * 10：四带两对
	 * 99：普通炸
	 * 100：王炸
	 * 
	 * 
	 * */
	//检查所选牌组是否符合规则
	function checkPoker(selected) {
		//初始化
		selected.type = 0;
		selected.max = 0;
		let poker = game.selected_poker.poker;

		//对选择的牌排序
		pokerArrSort(poker);

		switch(poker.length) {
			case 1:
				selected.type = 1;
				if(poker[0].num == 14 && poker[0].suit == 2) {
					selected.max = 15;
				} else {
					selected.max = poker[0].num;
				}
				break;

			case 2:
				if(poker[0].num == poker[1].num) {
					selected.type = poker[0].num == 14 ? 100 : 2;
					selected.max = poker[0].num;
				}
				break;

			case 3:
				if(poker[0].num == poker[2].num) {
					selected.type = 3;
					selected.max = poker[0].num;
				}
				break;

			case 4:
				if(poker[0].num == poker[3].num) {
					selected.type = 99;
					selected.max = poker[0].num;
				} else if(poker[0].num == poker[2].num || poker[1].num == poker[3].num) {
					selected.type = 4;
					selected.max = poker[1].num;
				}
				break;

			case 5:
				if(poker[0].num == poker[2].num && poker[3].num == poker[4].num || poker[2].num == poker[4].num && poker[0].num == poker[1].num) {
					selected.type = 8;
					selected.max = poker[2].num;
				} else if(checkStraight(poker)) {
					selected.type = 5;
					selected.max = poker[poker.length - 1].num;
				}
				break;
			case 6:
				if(checkStraight(poker)) {
					selected.type = 5;
					selected.max = poker[poker.length - 1].num;
				} else if(checkStraightPair(poker)) {
					selected.type = 6;
					selected.max = poker[poker.length - 1].num;
				} else if(poker[0].num == poker[3].num || poker[1].num == poker[4].num || poker[2].num == poker[5].num) {
					selected.type = 9;
					selected.max = poker[2].num;
				}
				break;
			case 7:
				if(checkStraight(poker)) {
					selected.type = 5;
					selected.max = poker[poker.length - 1].num;
				}
				break;
			case 8:
				if(checkStraight(poker)) {
					selected.type = 5;
					selected.max = poker[poker.length - 1].num;
				} else if(checkStraightPair(poker)) {
					selected.type = 6;
					selected.max = poker[poker.length - 1].num;
				} else if(poker[0].num == poker[3].num && poker[4].num == poker[5].num && poker[6].num == poker[7].num ||
					poker[0].num == poker[1].num && poker[2].num == poker[5].num && poker[6].num == poker[7].num) {
					//四带两对第一种情况
					selected.type = 10;
					selected.max = poker[2].num;
				} else if(poker[0].num == poker[1].num && poker[2].num == poker[3].num && poker[4].num == poker[7].num) {
					//四带两对第二种情况
					selected.type = 10;
					selected.max = poker[4].num;
				} else {
					//判断是否为飞机
					checkPlane(poker, selected);
				}
				break;
			case 9:
				if(checkStraight(poker)) {
					selected.type = 5;
					selected.max = poker[poker.length - 1].num;
				}
				break;
			case 10:
				if(checkStraight(poker)) {
					selected.type = 5;
					selected.max = poker[poker.length - 1].num;
				} else if(checkStraightPair(poker)) {
					selected.type = 6;
					selected.max = poker[poker.length - 1].num;
				} else {
					//判断是否为飞机
					checkPlane(poker, selected);
				}
				break;
			case 11:
				if(checkStraight(poker)) {
					selected.type = 5;
					selected.max = poker[poker.length - 1].num;
				}
				break;
			case 12:
				if(checkStraight(poker)) {
					selected.type = 5
					selected.max = poker[poker.length - 1].num;
				} else if(checkStraightPair(poker)) {
					selected.type = 6;
					selected.max = poker[poker.length - 1].num;
				} else {
					//判断是否为飞机
					checkPlane(poker, selected);
				}
				break;
			case 14:
				if(checkStraightPair(poker)) {
					selected.type = 6;
					selected.max = poker[poker.length - 1].num;
				}
				break;
			case 15:
				checkPlane(poker, selected);
				break;
			case 16:
				if(checkStraightPair(poker)) {
					selected.type = 6;
					selected.max = poker[poker.length - 1].num;
				} else {
					checkPlane(poker, selected);
				}
				break;
			case 18:
				if(checkStraightPair(poker)) {
					selected.type = 6;
					selected.max = poker[poker.length - 1].num;
				}
				break;
			case 20:
				if(checkStraightPair(poker)) {
					selected.type = 6;
					selected.max = poker[poker.length - 1].num;
				} else {
					checkPlane(poker, selected);
				}
				break;
		}
	}
	//判断是否为顺子
	function checkStraight(poker) {
		if(poker[poker.length - 1].num > 12) {
			return false;
		}
		for(let i = 0; i < poker.length - 1; i++) {
			if(poker[i].num + 1 != poker[i + 1].num) {
				return false;
			}
		}
		return true;
	}

	//判断是否为连对
	function checkStraightPair(poker) {
		if(poker[0].num != poker[1].num || poker[poker.length - 1].num > 13) {
			return false;
		}
		for(let i = 0; i < poker.length - 2; i++) {
			if(poker[i].num + 1 != poker[i + 2].num) {
				return false;
			}
		}
		return true;
	}

	//判断是否为飞机
	function checkPlane(poker, selected) {
		if(poker.length == 8) {

			//飞机带两单
			if(poker[2].num + 1 == poker[5].num) {
				if(poker[0].num == poker[2].num && poker[3].num == poker[5].num ||
					poker[1].num == poker[3].num && poker[4].num == poker[6].num ||
					poker[2].num == poker[4].num && poker[5].num == poker[7].num) {
					selected.type = 7;
					selected.max = poker[5].num;
				}
			}

		} else if(poker.length == 10) {

			//飞机带两双
			/*
			 * 333 444 55 66
			 * 33 444 555 66
			 * 33 44 555 666
			 */
			if(poker[0].num == poker[2].num && poker[3].num == poker[5].num && poker[6].num == poker[7].num && poker[8].num == poker[9].num && poker[0].num + 1 == poker[3].num) {
				selected.type = 7;
				selected.max = poker[3].num;
			} else if(poker[4].num + 1 == poker[7].num && (poker[0].num == poker[1].num && poker[2].num == poker[4].num && poker[5].num == poker[7].num && poker[8].num == poker[9].num || poker[0].num == poker[1].num && poker[2].num == poker[3].num && poker[4].num == poker[6].num && poker[7].num == poker[9].num)) {
				selected.type = 7;
				selected.max = poker[7].num;
			}

		} else if(poker.length == 12) {
			//飞机带3单
			/*
			 * ***666777888
			 * **666777888*
			 * *666777888**
			 * 
			 * 666777888***
			 * !!!
			 */
			if(poker[0].num + 1 == poker[3].num && poker[0].num + 2 == poker[6].num && poker[0].num == poker[2].num && poker[3].num == poker[5].num && poker[6].num == poker[8].num) {
				selected.type = 7;
				selected.max = poker[6].num;
			} else if(poker[1].num == poker[3].num && poker[4].num == poker[6].num && poker[7].num == poker[9].num ||
				poker[2].num == poker[4].num || poker[5].num == poker[7].num && poker[8].num == poker[10].num ||
				poker[3].num == poker[5].num && poker[6].num == poker[8].num && poker[9].num == poker[11].num) {
				if(poker[3].num + 1 == poker[6].num && poker[3].num + 2 == poker[9]) {
					selected.type = 7;
					selected.max = poker[9].num;
				}
			}
		} else if(poker.length == 15) {
			//飞机带三双
			/*
			 * 666777888aabbcc
			 * aa666777888bbcc
			 * aabb666777888cc
			 * aabbcc666777888
			 */
			if(poker[0].num == poker[2].num && poker[3].num == poker[5].num && poker[6].num == poker[8].num && poker[9].num == poker[10].num &&
				poker[11].num == poker[12].num && poker[13].num == poker[14].num) {
				if(poker[2].num + 1 == poker[5].num && poker[2].num + 2 == poker[8].num) {
					selected.type = 7;
					selected.max = poker[8].num;
				}
			} else if(poker[2].num == poker[4].num && poker[5].num == poker[7].num && poker[8].num == poker[10].num && poker[0].num == poker[1].num &&
				poker[11].num == poker[12].num && poker[13].num == poker[14].num) {
				if(poker[2].num + 1 == poker[5].num && poker[2].num + 2 == poker[8].num) {
					selected.type = 7;
					selected.max = poker[8].num;
				}
			} else if(poker[4].num == poker[6].num && poker[7].num == poker[9].num && poker[10].num == poker[12].num && poker[0].num == poker[1].num &&
				poker[2].num == poker[3].num && poker[13].num == poker[14].num) {
				if(poker[6].num + 1 == poker[9].num && poker[6].num + 2 == poker[12].num) {
					selected.type = 7;
					selected.max = poker[12].num;
				}
			} else if(poker[6].num == poker[8].num && poker[9].num == poker[11].num && poker[12].num == poker[14].num && poker[0].num == poker[1].num &&
				poker[2].num == poker[3].num && poker[4].num == poker[5].num) {
				if(poker[6].num + 1 == poker[9].num && poker[6].num + 2 == poker[12].num) {
					selected.type = 7;
					selected.max = poker[12].num;
				}
			}
		} else if(poker.length == 16) {
			//飞机带四单
			/*
			 * 666777888999****
			 * *666777888999***
			 * **666777888999**
			 * 
			 * ***666777888999*
			 * ****666777888999
			 */
			if(poker[0].num == poker[2].num && poker[3].num == poker[5].num && poker[6].num == poker[8].num && poker[9].num == poker[11].num ||
				poker[1].num == poker[3].num && poker[4].num == poker[6].num && poker[7].num == poker[9].num && poker[10].num == poker[12].num ||
				poker[2].num == poker[4].num && poker[5].num == poker[7].num && poker[8].num == poker[10].num && poker[11].num == poker[13].num) {
				if(poker[2].num + 1 == poker[5].num && poker[2].num + 2 == poker[8].num && poker[2].num + 3 == poker[11].num) {
					selected.type = 7;
					selected.max = poker[11].num;
				}
			} else if(poker[3].num == poker[5].num && poker[6].num == poker[8].num && poker[9].num == poker[11].num && poker[12].num == poker[14].num ||
				poker[4].num == poker[6].num && poker[7].num == poker[9].num && poker[10].num == poker[12].num && poker[13].num == poker[15].num) {
				if(poker[4].num + 1 == poker[7].num && poker[4].num + 2 == poker[10].num && poker[4].num + 3 == poker[13].num) {
					selected.type = 7;
					selected.max = poker[14].num;
				}
			}
		} else if(poker.length == 20) {
			//飞机带四双
			/*
			 * 666777888999aabbccdd
			 * aa666777888999bbccdd
			 * aabb666777888999ccdd
			 * aabbcc666777888999dd
			 * aabbccdd666777888999
			 */
			if(poker[0].num == poker[2].num && poker[3].num == poker[5].num && poker[6].num == poker[8].num && poker[9].num == poker[11].num && poker[12].num == poker[13].num && poker[14].num == poker[15].num && poker[16].num == poker[17].num && poker[18].num == poker[19].num ||
				poker[2].num == poker[4].num && poker[5].num == poker[7].num && poker[8].num == poker[10].num && poker[11].num == poker[13].num && poker[0].num == poker[1].num && poker[14].num == poker[15].num && poker[16].num == poker[17].num && poker[18].num == poker[19].num) {
				if(poker[2].num + 1 == poker[5].num && poker[2].num + 2 == poker[8].num && poker[2].num + 3 == poker[11].num) {
					selected.type = 7;
					selected.max = poker[11].num;
				}
			} else if(poker[4].num == poker[6].num && poker[7].num == poker[9].num && poker[10].num == poker[12].num && poker[13].num == poker[15].num && poker[0].num == poker[1].num && poker[2].num == poker[3].num && poker[16].num == poker[17].num && poker[18].num == poker[19].num ||
				poker[6].num == poker[8].num && poker[9].num == poker[11].num && poker[12].num == poker[14].num && poker[15].num == poker[17].num && poker[0].num == poker[1].num && poker[2].num == poker[3].num && poker[4].num == poker[5].num && poker[18].num == poker[19].num) {
				if(poker[6].num + 1 == poker[9].num && poker[6].num + 2 == poker[12].num && poker[6].num + 3 == poker[15].num) {
					selected.type = 7;
					selected.max = poker[15].num;
				}
			} else if(poker[8].num == poker[10].num && poker[11].num == poker[13].num && poker[14].num == poker[16].num && poker[17].num == poker[19].num && poker[0].num == poker[1].num && poker[2].num == poker[3].num && poker[4].num == poker[5].num && poker[6].num == poker[7].num) {
				if(poker[10].num + 1 == poker[13].num && poker[10].num + 2 == poker[16].num && poker[10].num + 3 == poker[19].num) {
					selected.type = 7;
					selected.max = poker[19].num;
				}
			}
			return false
		}
	}
	//将选择牌组与桌面牌组比较
	function vsPoker() {
		let sel_len = game.selected_poker.poker.length;
		let des_len = game.desktop_poker.poker.length;
		let sel_type = game.selected_poker.type;
		let des_type = game.desktop_poker.type;
		let sel_max = game.selected_poker.max;
		let des_max = game.desktop_poker.max;

		//若台上没牌
		if(des_type == 0) {
			return true;
		}

		//若将打出的手牌为王炸
		if(sel_type == 100) {
			return true;
		}

		//若桌上为王炸
		if(des_type == 100) {
			return false;
		}

		//若手牌为普通炸弹而桌上为非炸弹的牌
		if(sel_type == 99 && des_type != 99) {
			return true;
		}

		//判断其余普通牌
		if(sel_len == des_len && sel_type == des_type && sel_max > des_max) {
			return true;
		}

		return false;
	}
	//玩家打出手牌后刷新手牌
	function delPlayerPoker(index) {
		let selected = game.selected_poker.poker;
		let hand = player[index - 1].poker;

		for(let i = 0; i < selected.length; i++) {
			for(let j = 0; j < hand.length; j++) {
				if(selected[i].num == hand[j].num && selected[i].suit == hand[j].suit) {
					hand.splice(j, 1);
				}
			}
		}
		//重新加载手牌
		$('.play').eq(index - 1).find('li').remove();
		let len = player[index - 1].poker.length
		for(let i = 0; i < len; i++) {
			poker_data = player[index - 1].poker[i];
			poker_tmp = getFrontPoker(poker_data);
			$('.play').eq(index - 1).append(poker_tmp);
			if(index == 2) {
				$('.play').eq(index - 1).find('li:last').css('left', i * 30 + 'px');
				$('.play').eq(index - 1).css('left', -i * 15 + 'px');
			} else {
				$('.play').eq(index - 1).find('li:last').css('top', i * 26 + 'px');
			}
		}

	}

	//提示功能
	function getHint(index) {
		//先移除选中的牌
		$('.play').eq(index - 1).find('li').removeClass('selected');
		game.selected_poker.poker.splice(0);
		game.selected_poker.type = 0;
		game.selected_poker.max = 0;
		let desk_type = game.desktop_poker.type;
		let desk_max = game.desktop_poker.max;
		let desk_poker = game.desktop_poker.poker;
		let sel_poker = game.selected_poker.poker;
		let player_poker = player[index - 1].poker;
		let tmp = [];
		if(player_poker.length >= desk_poker.length) {
			switch(desk_type) {
				case 0:
					sel_poker.push(player[index - 1].poker[0]);
					$('.play').eq(index - 1).find('li:first').addClass('selected');
					break;
				case 1:
					for(let i = 0; i < player_poker.length; i++) {
						if(player_poker[i].num > desk_max || (desk_max == 14 && player_poker[i].num == 14 && player_poker[i].suit > desk_poker[0].suit)) {
							sel_poker.push(player_poker[i]);
							$('.play').eq(index - 1).find('li').eq(i).addClass('selected');
							break;
						}
					}
					break;
				case 2:
					for(let i = 0; i < player_poker.length - 1; i++) {
						if(player_poker[i].num > desk_max && player_poker[i].num == player_poker[i + 1].num) {
							sel_poker.push(player_poker[i], player_poker[i + 1]);
							$('.play').eq(index - 1).find('li').slice(i, i + 2).addClass('selected');
							break;
						}
					}
					break;
				case 3:
					for(let i = 0; i < player_poker.length - 2; i++) {
						if(player_poker[i].num > desk_max && player_poker[i].num == player_poker[i + 2].num) {
							sel_poker.push(player_poker[i], player_poker[i + 1], player_poker[i + 2]);
							$('.play').eq(index - 1).find('li').slice(i, i + 3).addClass('selected');
							break;
						}
					}
					break;
				case 4:
					for(let i = 0; i < player_poker.length - 2; i++) {
						if(player_poker[i].num > desk_max && player_poker[i].num == player_poker[i + 2].num) {
							sel_poker.push(player_poker[i], player_poker[i + 1], player_poker[i + 2]);
							if(i == 0) {
								sel_poker.push(player_poker[3]);
								$('.play').eq(index - 1).find('li').eq(3).addClass('selected');
							} else {
								sel_poker.push(player_poker[0]);
								$('.play').eq(index - 1).find('li').eq(0).addClass('selected');
							}
							$('.play').eq(index - 1).find('li').slice(i, i + 3).addClass('selected');
							break;
						}
					}
					break;
				case 5:
					for(let i = 0; i < player_poker.length; i++) {
						if(player_poker[i].num > desk_max && player_poker[i].num < 13) {
							for(let j = 0; j < desk_poker.length; j++) {
								if(!containNum(player_poker, player_poker[i].num - j, tmp)) {
									break;
								}
							}
						}
						if(tmp.length == desk_poker.length) {
							//找到符合条件的牌组
							for(let k = 0; k < tmp.length; k++) {
								sel_poker.push(player_poker[tmp[k]]);
								$('.play').eq(index - 1).find('li').eq(tmp[k]).addClass('selected');
							}
							break;
						} else {
							tmp.splice(0);
						}
					}
					break;
				case 6:
					for(let i = 0; i < player_poker.length; i++) {
						if(player_poker[i].num > desk_max && player_poker[i].num < 14) {
							for(let j = 0; j < desk_poker.length / 2; j++) {
								if(!containPair(player_poker, player_poker[i].num - j, tmp)) {
									break;
								}
							}
						}
						if(tmp.length == desk_poker.length) {
							//找到符合条件的牌组
							for(let k = 0; k < tmp.length; k++) {
								sel_poker.push(player_poker[tmp[k]]);
								$('.play').eq(index - 1).find('li').eq(tmp[k]).addClass('selected');
							}
							break;
						} else {
							tmp.splice(0);
						}
					}
					break;
				case 7:
					for(let i = 0; i < player_poker.length; i++) {
						if(player_poker[i].num > desk_max && player_poker[i].num < 13) {
							if(desk_poker.length == 8) {
								containPlane1(player_poker, player_poker[i].num, tmp);
							} else if(desk_poker.length == 10) {
								containPlane2(player_poker, player_poker[i].num, tmp);
							}
						}
						if(tmp.length == desk_poker.length) {
							//找到符合条件的牌组
							for(let k = 0; k < tmp.length; k++) {
								sel_poker.push(player_poker[tmp[k]]);
								$('.play').eq(index - 1).find('li').eq(tmp[k]).addClass('selected');
							}
							break;
						} else {
							tmp.splice(0);
						}
					}
				case 8:
					for(let i = 0; i < player_poker.length; i++) {
						if(player_poker[i].num > desk_max && player_poker[i].num < 14) {
							containThree(player_poker, player_poker[i].num, tmp);
						}
						if(tmp.length == desk_poker.length) {
							//找到符合条件的牌组
							for(let k = 0; k < tmp.length; k++) {
								sel_poker.push(player_poker[tmp[k]]);
								$('.play').eq(index - 1).find('li').eq(tmp[k]).addClass('selected');
							}
							break;
						} else {
							tmp.splice(0);
						}
					}
					break;
				case 9:
					for(let i = 0; i < player_poker.length; i++) {
						if(player_poker[i].num > desk_max && player_poker[i].num < 14) {
							containFour(player_poker, player_poker[i].num, tmp);
						}
						if(tmp.length == desk_poker.length) {
							//找到符合条件的牌组
							for(let k = 0; k < tmp.length; k++) {
								sel_poker.push(player_poker[tmp[k]]);
								$('.play').eq(index - 1).find('li').eq(tmp[k]).addClass('selected');
							}
							break;
						} else {
							tmp.splice(0);
						}
					}
					break;
				case 10:
					for(let i = 0; i < player_poker.length; i++) {
						if(player_poker[i].num > desk_max && player_poker[i].num < 14) {
							containFour2(player_poker, player_poker[i].num, tmp);
						}
						if(tmp.length == desk_poker.length) {
							//找到符合条件的牌组
							for(let k = 0; k < tmp.length; k++) {
								sel_poker.push(player_poker[tmp[k]]);
								$('.play').eq(index - 1).find('li').eq(tmp[k]).addClass('selected');
							}
							break;
						} else {
							tmp.splice(0);
						}
					}
					break;
				case 99:
					for(let i = 0; i < player_poker.length - 3; i++) {
						if(player_poker[i].num > desk_max && player_poker[i].num < 14 && player_poker[i].num == player_poker[i + 3].num) {
							tmp.push(i, i + 1, i + 2, i + 3);
						}
						if(tmp.length == desk_poker.length) {
							//找到符合条件的牌组
							for(let k = 0; k < tmp.length; k++) {
								sel_poker.push(player_poker[tmp[k]]);
								$('.play').eq(index - 1).find('li').eq(tmp[k]).addClass('selected');
							}
							break;
						} else {
							tmp.splice(0);
						}
					}
					break;
			}
		}
		//当找不到相同牌型的牌时找炸弹
		if(sel_poker.length == 0) {
			if(desk_type != 99 && desk_type != 100) {
				for(let i = 0; i < player_poker.length - 3; i++) {
					if(player_poker[i].num == player_poker[i + 3].num) {
						//找到普通炸弹
						tmp.push(i, i + 1, i + 2, i + 3);
						for(let k = 0; k < tmp.length; k++) {
							sel_poker.push(player_poker[tmp[k]]);
							$('.play').eq(index - 1).find('li').eq(tmp[k]).addClass('selected');
						}
					}
				}
			}
			if(desk_type == 99 || sel_poker.length == 0) {
				if(player_poker[player_poker.length - 1].num == 14 && player_poker[player_poker.length - 2].num == 14) {
					tmp.push(player_poker.length - 1, player_poker.length - 2);
				}
				if(tmp.length == 2) {
					//找到王炸
					for(let k = 0; k < tmp.length; k++) {
						sel_poker.push(player_poker[tmp[k]]);
						$('.play').eq(index - 1).find('li').eq(tmp[k]).addClass('selected');
					}
				}
			}
		}

		//判断是否可以出牌
		if(sel_poker.length == 0) {
			$('.play_btn2 .play_out').attr('disabled', true);
		} else {
			$('.play_btn2 .play_out').attr('disabled', false);
		}
	}
	//判断手牌中是否有特定点数的牌,若有则将对应下标加入tmp数组中并返回true
	function containNum(arr, num, tmp) {
		for(let i = 0; i < arr.length; i++) {
			if(arr[i].num == num) {
				tmp.push(i);
				return true;
			}
		}
		return false;
	}
	//判断手牌中是否有特定点数的对牌,若有则将对应下标加入tmp数组中并返回true
	function containPair(arr, num, tmp) {
		for(let i = 0; i < arr.length - 1; i++) {
			if(arr[i].num == num && arr[i + 1].num == num) {
				tmp.push(i, i + 1);
				return true;
			}
		}
		return false;
	}
	//判断手牌中是否有特定点数的三带二,若有则将对应下标加入tmp数组中并返回true
	function containThree(arr, num, tmp) {
		for(let i = 0; i < arr.length - 2; i++) {
			if(arr[i].num == num && arr[i + 1].num == num && arr[i + 2].num == num) {
				for(let j = 0; j < arr.length - 1; j++) {
					if(arr[j].num == arr[j + 1].num && arr[i].num != arr[j].num) {
						tmp.push(i, i + 1, i + 2, j, j + 1);
						return true;
					}
				}
			}
		}
		return false;
	}
	//判断手牌中是否有特定点数的四带二单,若有则将对应下标加入tmp数组中并返回true
	function containFour(arr, num, tmp) {
		let count = 0;
		for(let i = 0; i < arr.length - 3; i++) {
			if(arr[i].num == num && arr[i + 1].num == num && arr[i + 2].num == num && arr[i + 3].num == num) {
				tmp.push(i, i + 1, i + 2, i + 3);
				for(let j = 0; j < arr.length; j++) {
					if(arr[i].num != arr[j].num) {
						tmp.push(j);
						count++;
						if(count == 2) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}
	//判断手牌中是否有特定点数的四带两对,若有则将对应下标加入tmp数组中并返回true
	function containFour2(arr, num, tmp) {
		let count = 0;
		for(let i = 0; i < arr.length - 3; i++) {
			if(arr[i].num == num && arr[i + 1].num == num && arr[i + 2].num == num && arr[i + 3].num == num) {
				tmp.push(i, i + 1, i + 2, i + 3);
				for(let j = 0; j < arr.length; j++) {
					if(arr[i].num != arr[j].num && arr[j].num == arr[j + 1].num) {
						tmp.push(j, j + 1);
						j++;
						count++;
						if(count == 2) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}
	//判断是否有特定点数的飞机（3 3 1 1） 
	function containPlane1(arr, num, tmp) {
		let count = 0
		for(let i = 3; i < arr.length - 3; i++) {
			if(arr[i].num == arr[i + 2].num && arr[i].num == num && arr[i - 3].num == arr[i - 1].num && arr[i - 1].num == num - 1) {
				tmp.push(i - 3, i - 2, i - 1, i, i + 1, i + 2);
				for(let j = 0; j < arr.length; j++) {
					if(arr[i].num != arr[j].num && arr[i - 1].num != arr[j].num) {
						tmp.push(j);
						count++;
						if(count == 2) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	//判断是否有特定点数的飞机（3 3 2 2） 
	function containPlane2(arr, num, tmp) {
		let count = 0
		for(let i = 3; i < arr.length - 3; i++) {
			if(arr[i].num == arr[i + 2].num && arr[i].num == num && arr[i - 3].num == arr[i - 1].num && arr[i - 1].num == num - 1) {
				tmp.push(i - 3, i - 2, i - 1, i, i + 1, i + 2);
				for(let j = 0; j < arr.length; j++) {
					if(arr[i].num != arr[j].num && arr[i - 1].num != arr[j].num && arr[j].num == arr[j + 1].num) {
						tmp.push(j, j + 1);
						j++;
						count++;
						if(count == 2) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	//抢地主计时器
	function countDown(candidate, num) {
		let s = 15;
		// console.log(cancelNum);
		$('.time').eq(candidate - 1).css({
			display: 'block'
		}).html(s);
		game.timer = setInterval(function() {
			if(s > 0) {
				$('.time').eq(candidate - 1).html(--s)

			} else {
				$('.time').eq(candidate - 1).css({
					display: 'none'
				});

				$('.play_btn').eq(candidate - 1).find('.cancel').trigger('click');
			}
		}, 1000);
	}
	//出牌计时器
	function overTime(candidate, num) {
		let t = 15;
		$('.time').eq(candidate - 1).css({
			display: 'block'
		}).html(t)
		game.timer = setInterval(function() {

			if(t > 0) {
				$('.time').eq(candidate - 1).html(--t)

			} else {
				$('.time').eq(candidate - 1).css({
					display: 'none'
				});
				$('.play_btn2').eq(candidate - 1).find('.hint').trigger('click');
				if(game.selected_poker.poker.length == 0) {
					$('.play_btn2').eq(candidate - 1).find('.pass').trigger('click');
				} else {
					$('.play_btn2').eq(candidate - 1).find('.play_out').trigger('click');
				}
			}
		}, 1000)
	}

	//设置背景乐音量大小
	$('.bg-music').prop('volume', 0.1);

	//封装动画函数
	function animation() {
		$('.animation div').removeClass();
		if(game.selected_poker.type == 99) {
			$('.animation div').addClass('bomb_box');
		} else if(game.selected_poker.type == 7) {
			$('.animation div').addClass('plane_box');
		} else if(game.selected_poker.type == 100) {
			$('.animation div').addClass('rocket_box');
		} else if(game.selected_poker.type == 5) {
			setTimeout(function() {
				$('.animation div').addClass('shunZi_box');
				setTimeout(function() {
					$('.animation div').removeClass('shunZi_box');
				}, 1200);
			}, 500);
		} else if(game.selected_poker.type == 6) {
			setTimeout(function() {
				$('.animation div').addClass('lianDui_box');
				setTimeout(function() {
					$('.animation div').removeClass('lianDui_box');
				}, 1200);
			}, 500);
		}
	}

	let arr = [
		'sanTiao',
		'sanDaiYi',
		'shunZi',
		'lianDui',
		'feiJi',
		'sanDaiYiDui',
		'siDaiEr',
		'siDaiLiangDui',
		'zhaDan',
		'wangZha'
	];
	// 封住音频函数
	function autoPlay() {
		let name; //保存音频路径
		$audio = $('.noloop-music');
		if(game.selected_poker.type == 1) { //单张音效
			name = game.selected_poker.max + 2
		} else if(game.selected_poker.type == 2) { //对子
			name = 'dui' + (game.selected_poker.max + 2);
		} else if(game.selected_poker.type == 99) { //普通炸
			name = 'zhaDan';
		} else if(game.selected_poker.type == 100) { //王炸
			name = 'wangZha';
		} else {
			name = arr[game.selected_poker.type - 3];
		}
		$audio.attr('src', './music/' + name + '.mp3');
		if(game.selected_poker.type == 7) {
			$('.loop-music').attr('src', './music/plane.mp3');
		} else if(game.selected_poker.type == 100) {
			$('.loop-music').attr('src', './music/rocket.mp3');
		} else if(game.selected_poker.type == 99)(
			setTimeout(function() {
				$('.noloop-music').attr('src', './music/boom.wav')
			}, 1500)
		)
		setTimeout(function() {
			$('.loop-music').attr('src', '');
		}, 4000);
	}

	// 封装聊天框函数

	function chat() {
		let t;
		$('.weiXin').click(function() {
			$('.chat').toggle();
		});
		for(let i = 0; i < 6; i++) {
			$('.chitchat span').eq(i).click(function() {
				$('.noloop-music').attr('src', './music/c' + (i + 1) + '.mp3');
				$('.alertChat').show();
				clearTimeout(t);
				$('.alertChat span').html($('.chitchat span').eq(i).html());
				t = setTimeout(function() {
					$('.alertChat').css({
						'display': 'none'
					});
				}, 2000);
			});
		}

	}
	chat();

	function win(index) {
		
		$('tr').eq(0).children().eq(1).html(player1.name);
		$('tr').eq(0).children().eq(2).html(player2.name);
		$('tr').eq(0).children().eq(3).html(player3.name);
		
		//玩家初始积分
		$('tr').eq(1).children().eq(1).html(player1.integral);
		$('tr').eq(1).children().eq(2).html(player2.integral);
		$('tr').eq(1).children().eq(3).html(player3.integral);
		
		if(player[index - 1].role == 1) {
			// console.log(index);
			for(let i = 0; i < 3; i++) {
				player[i].integral -= game.mul;
				$('tr').eq(2).children().eq(i + 1).html('-' + game.mul);
			}
			player[index - 1].integral += 3 * game.mul;
			$('tr').eq(2).children().eq(index).html('+' + game.mul * 2)
		} else {
			for(let i = 0; i < 3; i++) {
				if(player[i].role == 1) {
					player[i].integral -= game.mul;
					$('tr').eq(2).children().eq(i + 1).html('-' + game.mul*2);

				} else {
					player[i].integral += game.mul / 2;
					$('tr').eq(2).children().eq(i + 1).html('+' + game.mul)
				}
			}

		}
		

		//玩家初始积分
		$('tr').eq(3).children().eq(1).html(player1.integral);
		$('tr').eq(3).children().eq(2).html(player2.integral);
		$('tr').eq(3).children().eq(3).html(player3.integral);
		
		$('.p1_integral').html(player1.integral);
		$('.p2_integral').html(player2.integral);
		$('.p3_integral').html(player3.integral);

		//出完牌计分
		$('.zzc').css("display", "block");
		$('table').css("display", "block");
		$('.table_bg').css("display", "block");
		$('.continue_btn').show().on('click', function() {
			saveToStorage();
			window.location.href = window.location.href;
		});

	}

	// 将数据保存到 sessionStorage 对象中  
	function saveToStorage() {
		//sessionStorage   
		if(window.sessionStorage) {
			window.sessionStorage.setItem("player1_name", player[0].name);
			window.sessionStorage.setItem("player1_inte", player[0].integral);
			window.sessionStorage.setItem("player2_name", player[1].name);
			window.sessionStorage.setItem("player2_inte", player[1].integral);
			window.sessionStorage.setItem("player3_name", player[2].name);
			window.sessionStorage.setItem("player3_inte", player[2].integral);
		} else {
			// 不支持 sessionStorage，用 Dojo 实现相同功能  
			console.log('not ok');
		}
	}
	// 从 sessionStorage 对象中取出数据  
	function getStorage() {
		if(window.sessionStorage) {
			player1_name = window.sessionStorage.getItem("player1_name");
			player1_inte = window.sessionStorage.getItem("player1_inte");
			player2_name = window.sessionStorage.getItem("player2_name");
			player2_inte = window.sessionStorage.getItem("player2_inte");
			player3_name = window.sessionStorage.getItem("player3_name");
			player3_inte = window.sessionStorage.getItem("player3_inte");
			if(player1_name != null) {
				player[0].name = player1_name;
				player[0].integral = player1_inte;
				player[1].name = player2_name;
				player[1].integral = player2_inte;
				player[2].name = player3_name;
				player[2].integral = player3_inte;
				game.first_game = false;
				console.log(player);
			}
			else {
				console.log('321');
			}
		} else {
			console.log('not ok');
		}
	}
});