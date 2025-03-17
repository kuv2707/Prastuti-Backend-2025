const Team = require("../models/Teams");
const Events = require("../models/Events");
const Users = require("../models/Users");

const register_solo = async (req, res) => {
	const user = await Users.findById(req.body.user_id);
	const event = await Events.findOne({
		Name: req.body.event_name,
	});

	if (!user || !event) {
		return res.status(404).json({
			message: "User or event not found",
		});
	}

	if (event.team_event) {
		res.status(404).json({
			status: "Fail",
			message:
				"Cannot register as an individual in team event",
		});
		return;
	}

	// Check if already registered
	const eventFound = user.Events_Participated.find((e) =>
		e._id.equals(event._id)
	);
	if (eventFound) {
		res.status(404).json({
			message: "You already registered for this event",
		});
		return;
	}

	//Add event in User
	user.Events_Participated.push(event._id);

	//Add User in Event
	event.Participants.push({
		participant: user._id,
		Score: 0,
	});

	//Increment no. of participants
	event.no_of_participants = event.no_of_participants + 1;

	await event.save();

	//updating in db
	await user.save();

	res.status(200).json({
		message: "Registered Succeessfully",
		updatedUser: user,
	});
};

const register_team = async (req, res) => {
	console.log(req.body);
	const team = await Team.findOne({
		Team_Name: req.body.team_name,
	});
	const event = await Events.findOne({
		Name: req.body.event_name,
	});
	const curUser = await Users.findById(req.body.user_id);

	if (!team) {
		return res.status(404).json({
			status: "Fail",
			message: "Team not found",
		});
	}

	if (!event) {
		return res.status(404).json({
			status: "Fail",
			message: "Event not found",
		});
	}
	console.log(team.Members, team._id, team.Team_Name);
	const isMember = team.Members.find((member) =>
		member._id.equals(curUser._id)
	);
	if (!isMember) {
		res.status(404).json({
			status: "Fail",
			message: "Only team member can register team",
		});
		return;
	}

	// Check if Team Event
	if (!event.team_event) {
		res.status(404).json({
			status: "Fail",
			message: "A team cannot be registered in a solo_event",
		});
		return;
	}

	// Check if already registered
	const eventExists = team.Events_Participated.find((e) =>
		e._id.equals(event._id)
	);
	if (eventExists) {
		res.status(404).json({
			message: "Team already registered for this event",
		});
		return;
	}

	async function checkUsersParticipation() {
		let check = 0;
		for (var i = 0; i < team.Members.length; i++) {
			const member = await Users.findById(
				team.Members[i]._id
			);
			if (
				member.Events_Participated.find((e) => {
					return e.Name === event.Name;
				})
			) {
				check++;
			}
		}
		return check;
	}

	const check = await checkUsersParticipation();
	if (check > 0) {
		res.status(404).json({
			status: "Fail",
			message:
				"One or more user is already registered in the event with a different team",
		});
		return;
	}

	//Add a team in Event
	event.teams.push({
		team: team._id,
		Score: 0,
	});
	event.no_of_participants =
		event.no_of_participants + team.Members.length;

	//Add Event in all Users
	await team.Members.forEach(async (member) => {
		if (member._id !== curUser._id) {
			let registeredUser = await Users.findById(member._id);
			registeredUser.Events_Participated.push(event._id);
			await Users.findByIdAndUpdate(
				registeredUser._id,
				{
					Events_Participated:
						registeredUser.Events_Participated,
				},
				{
					new: true,
				}
			);
		}
	});

	//Add Event in Team
	team.Events_Participated.push(event._id);

	await team.save();
	await event.save();
	curUser.Events_Participated.push(event._id);
	await curUser.save();

	res.status(200).json({
		message: "Team registered successfully",
		updatedUser: curUser,
	});
};

module.exports = { register_solo, register_team };
