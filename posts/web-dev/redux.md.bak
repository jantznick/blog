---
title: Using Redux to Manage State in a Vanilla JS Application
description: Using Redux to Manage State in a Vanilla JS Application
date: 2024-03-05
tags: web-dev
layout: layouts/post.njk
---

Sample of getting [redux](https://redux.js.org/) working with in vanilla javascript. This can be used to better manage state within a page that uses D3 to vizualize data. Hopefully it can help reduce the amount of data stored client side for potentially slower computers. However this might have the drawback of having to fetch data multiple times if a user wants to see older graphs again and that data has been deleted.

This example was pulled from [codepen](https://codepen.io/taeggeat/pen/mdVVPaO?editors=1010)

I am fairly familiar with Redux and that's why I'm using it here. It does feel like it may be a solution to a non problem. Perhaps something like [this](https://dev.to/vijaypushkin/dead-simple-state-management-in-vanilla-javascript-24p0) might be a little better. Potentially adding some sort of state key:value to D3 itself like in that blog may work as well.

<div>
	<p id="render-store"></p>
	<button id="add">+1</button>
	<button id="remove">-1</button>
	<button id="add10">+10</button>
	<button id="remove10">-10</button>
	<button id="reset">-> 0</button>
</div>

<script type="text/javascript" src="/js/redux.legacy-esm.js"></script>

<script>

	// ACTIONS
	const addAction = {
	type: 'ADD',
	};

	const removeAction = {
	type: 'REMOVE',
	};

	const add10Action = {
	type: 'ADD10',
	};

	const remove10Action = {
	type: 'REMOVE10',
	};

	const resetAction = {
	type: 'RESET',
	};

	const counterReducer = (state = 0, action) => {
	switch (action.type) {
		case 'ADD':
			return state + 1;
		case 'REMOVE':
			return state - 1;
		case 'ADD10':
				return state + 10;
		case 'REMOVE10':
				return state - 10;
		case 'RESET':
				return 0;
		default:
			return state;
	}
	}

	const store = createStore(counterReducer);
	console.log(store)

	// MAIN
	const renderStore = document.getElementById('render-store');
	const render = () => {
        renderStore.innerHTML = store.getState();
	}

	store.subscribe(render);
	render();


	const add = document.getElementById('add');
	add.addEventListener('click', () => {
        store.dispatch(addAction)
	});

	const remove = document.getElementById('remove');
	remove.addEventListener('click', () => {
        store.dispatch(removeAction)
	});

	const add10 = document.getElementById('add10');
	add10.addEventListener('click', () => {
        store.dispatch(add10Action)
	});

	const remove10 = document.getElementById('remove10');
	remove10.addEventListener('click', () => {
        store.dispatch(remove10Action)
	});

	const reset = document.getElementById('reset');
	reset.addEventListener('click', () => {
        store.dispatch(resetAction)
	});

</script>