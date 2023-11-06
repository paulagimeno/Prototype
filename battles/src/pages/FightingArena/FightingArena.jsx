import React, { useCallback, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function FightingArena() {
  const location = useLocation();
  const { fighter1, fighter2 } = location.state;
  const [battleStarted, setBattleStarted] = useState(false);
  console.log(location.state);
  const [battleSteps, setBattleSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playerChoice, setPlayerChoice] = useState("");
  const [attacker, setAttacker] = useState();
  const [defender, setDefender] = useState();
  const [fighter1maxHp, setFighter1maxHp] = useState(fighter1.hp);
  const [fighter2maxHp, setFighter2maxHp] = useState(fighter2.hp);
  const chatContainerRef = useRef();

  const abilities = {
    strike: (attacker, defender) => {
      const damage = calculateDamage(
        attacker.strenght,
        attacker.crit,
        defender.defense
      );
      defender.hp -= damage;
      return `${attacker.name} used Strike and dealt ${damage} damage.`;
    },
    execute: (attacker, defender) => {
      const randomNum = Math.floor(Math.random() * 10) + 1;
      if (randomNum === 1) {
        const damage = defender.hp;
        defender.hp -= damage;
        return `${attacker.name} successfully executed ${defender.name}.`;
      } else {
        return `${attacker.name}'s attack missed!`;
      }
    },
    heal: (attacker, defender) => {
      const recover = calculateRecover(attacker.strenght, attacker.crit);
      attacker.hp += recover;
      return `${attacker.name} used Heal and recovered ${recover} Health Points.`;
    },
    block: (attacker, defender) => {
      const extraHP = attacker.defense; // Modify as needed.
      attacker.extraHP = extraHP;
      return `${attacker.name} used Shield and gained a ${extraHP} points of shield.`;
    },
  };

  const calculateDamage = (strength, crit, defense) => {
    const baseDamage =
      Math.floor(Math.random() * (strength[1] - strength[0] + 1)) + strength[0];
    const randomNumber = Math.floor(Math.random() * 2) + 1;
    let critMultiplier;
    if (randomNumber === 1) {
      critMultiplier = crit / 100;
    } else {
      critMultiplier = 0;
    }

    const damage = (
      baseDamage * 2 +
      baseDamage * critMultiplier -
      defense
    ).toFixed(0);
    return parseFloat(damage);
  };

  const calculateRecover = (strength, crit) => {
    const baseRecover =
      Math.floor(Math.random() * (strength[1] - strength[0] + 1)) + strength[0];
    const randomNumber = Math.floor(Math.random() * 2) + 1;
    let critMultiplier;
    if (randomNumber === 1) {
      critMultiplier = crit / 100;
    } else {
      critMultiplier = 0;
    }

    const recover = (baseRecover * 2 + baseRecover * critMultiplier).toFixed(0);
    return parseFloat(recover);
  };

  const battle = () => {
    const steps = [];

    setBattleStarted(true);
    setBattleSteps(steps);

    steps.push(`${fighter1.name} and ${fighter2.name} are ready for battle!`);

    let attacker;
    if (fighter1.speed > fighter2.speed) {
      attacker = fighter1;
    } else if (fighter1.speed < fighter2.speed) {
      attacker = fighter2;
    } else {
      const randomNumber = Math.floor(Math.random() * 2) + 1;
      if (randomNumber === 1) {
        attacker = fighter1;
      } else {
        attacker = fighter2;
      }
    }

    let defender = attacker === fighter1 ? fighter2 : fighter1;

    setAttacker(attacker);
    setDefender(defender);

    const battleStep = (attacker, defender) => {
      if (fighter1.hp > 0 && fighter2.hp > 0) {
        steps.push(`It's ${attacker.name}'s turn.`);
        steps.push("Choose your next move:");

        if (attacker.category === "DPS") {
          steps.push(
            <div>
              <button className="abilityButton"
                onClick={() => chooseAbility("Strike", attacker, defender)}
              >
                Strike
              </button>
              <button className="abilityButton"
                onClick={() => chooseAbility("Execute", attacker, defender)}
              >
                Execute
              </button>
            </div>
          );
        } else if (attacker.category === "Healer") {
          steps.push(
            <div>
              <button className="abilityButton"
                onClick={() => chooseAbility("Strike", attacker, defender)}
              >
                Strike
              </button>
              <button className="abilityButton" onClick={() => chooseAbility("Heal", attacker, defender)}>
                Heal
              </button>
            </div>
          );
        } else if (attacker.category === "Tank") {
          steps.push(
            <div>
              <button className="abilityButton"
                onClick={() => chooseAbility("Strike", attacker, defender)}
              >
                Strike
              </button>
              <button className="abilityButton"
                onClick={() => chooseAbility("Block", attacker, defender)}
              >
                Block
              </button>
            </div>
          );
        }
      } else if (fighter1.hp <= 0 || fighter2.hp <= 0) {
        const winner = fighter1.hp > 0 ? fighter1 : fighter2;
        steps.push(`${winner.name} won the battle!`);
      }
    };

    const chooseAbility = (data, attacker, defender) => {
      setPlayerChoice(data);
      console.log(data);
      executeAttack(data, attacker, defender);
    };

    const executeAttack = (playerChoice, attacker, defender) => {
      if (playerChoice === "Strike") {
        steps.pop();
        const abilityResult = abilities.strike(attacker, defender);
        console.log(`${defender.name} hp is ${defender.hp}`);
        steps.push(abilityResult);
        if (defender.extraHP && defender.extraHP > 0) {
          defender.hp += defender.extraHP;
          steps.push(
            `${defender.name} blocked ${defender.extraHP} damage with the Shield.`
          ); // Reset the extraHP after it's consumed.
          defender.extraHP = 0;
        }
        console.log(steps);
        setPlayerChoice("");
        attacker = attacker === fighter1 ? fighter2 : fighter1;
        defender = attacker === fighter2 ? fighter1 : fighter2;
        setAttacker(attacker);
        setDefender(defender);
        console.log(`now the attacker will be ${attacker.name}`);
        battleStep(attacker, defender);
      } else if (playerChoice === "Execute") {
        steps.pop();
        const abilityResult = abilities.execute(attacker, defender);
        console.log(`${defender.name} hp is ${defender.hp}`);
        steps.push(abilityResult);
        console.log(steps);
        setPlayerChoice("");
        attacker = attacker === fighter1 ? fighter2 : fighter1;
        defender = attacker === fighter2 ? fighter1 : fighter2;
        setAttacker(attacker);
        setDefender(defender);
        console.log(`now the attacker will be ${attacker.name}`);
        battleStep(attacker, defender);
      } else if (playerChoice === "Heal") {
        steps.pop();
        const abilityResult = abilities.heal(attacker, defender);
        console.log(`${defender.name} hp is ${defender.hp}`);
        steps.push(abilityResult);
        console.log(steps);
        setPlayerChoice("");
        attacker = attacker === fighter1 ? fighter2 : fighter1;
        defender = attacker === fighter2 ? fighter1 : fighter2;
        setAttacker(attacker);
        setDefender(defender);
        console.log(`now the attacker will be ${attacker.name}`);
        battleStep(attacker, defender);
      } else if (playerChoice === "Block") {
        steps.pop();
        const abilityResult = abilities.block(attacker, defender);
        console.log(`${defender.name} hp is ${defender.hp}`);
        steps.push(abilityResult);
        console.log(steps);
        setPlayerChoice("");
        attacker = attacker === fighter1 ? fighter2 : fighter1;
        defender = attacker === fighter2 ? fighter1 : fighter2;
        setAttacker(attacker);
        setDefender(defender);
        console.log(`now the attacker will be ${attacker.name}`);
        battleStep(attacker, defender);
      }
    };

    battleStep(attacker, defender);
  };

  const scrollChatToBottom = () => {
    chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollChatToBottom();
    if (battle && currentStep < battleSteps.length - 1) {
      const timer = setInterval(() => {
        if (currentStep + 1 < battleSteps.length)
          setCurrentStep(currentStep + 1);
        console.log(currentStep);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [battleSteps, currentStep, battle]);

  const getStepText = (step) => {
    if (typeof step === "string") {
      return step;
    }
    return step.props.children;
  };

  const getStepClass = (step) => {
    const stepText = getStepText(step);

    if (stepText.includes(fighter1.name) && stepText.includes(fighter2.name)) {
      return "bothFighters";
    } else if (stepText.includes(fighter1.name)) {
      return "fighterOne";
    } else if (stepText.includes(fighter2.name)) {
      return "fighterTwo";
    }
    return "noFighter";
  };

  const getColorOne = () => {
    if ((fighter1.hp / fighter1maxHp) * 100 < 35){
      return "health-bar-inner1"
    } else if ((fighter1.hp / fighter1maxHp) * 100 < 65){
      return "health-bar-inner2"
    } else if ((fighter1.hp / fighter1maxHp) * 100 === 100){
      return "health-bar-inner-full"
    } else {
      return "health-bar-inner3"
    }
  }

  const getColorTwo = () => {
    if ((fighter2.hp / fighter2maxHp) * 100 < 35){
      return "health-bar-inner1"
    } else if ((fighter2.hp / fighter2maxHp) * 100 < 65){
      return "health-bar-inner2"
    } else if ((fighter2.hp / fighter2maxHp) * 100 === 100){
      return "health-bar-inner-full"
    }  else {
      return "health-bar-inner3"
    }
  }

  return (
    <div className="arena_body">
      <div className="arena_fighter1">
        <div className="arena_names">
          <p className="fighterName">
            {fighter1 ? fighter1.name.toUpperCase() : "Not selected"}
          </p>
        </div>
        <div className="arena_fighters">
          <img className="fighters" src={fighter1.fullBodyImage} alt="" />
        </div>
        <div className="arena_hps">
          <div className="health-bar">
            <div
              className={getColorOne()}
              style={{ width: `${(fighter1.hp / fighter1maxHp) * 100}%` }}
            ></div>
          </div>
          <p>HP: {fighter1.hp.toFixed(0)}</p>
        </div>
      </div>
      <div className="arena_battle">
        {!battleStarted ? (
          <button className="startFight" onClick={battle}>
            FIGHT!
          </button>
        ) : (
          <div className="battle">
            <div className="chat">
              {battleSteps.slice(0, currentStep + 1).map((step, index) => (
                <div className={getStepClass(step)} key={index}>
                  {step}
                </div>
              ))}
              <div ref={chatContainerRef} />
            </div>
          </div>
        )}
      </div>
      <div className="arena_fighter2">
        <div className="arena_names">
          <p className="fighterName">
            {fighter2 ? fighter2.name.toUpperCase() : "Not selected"}
          </p>
        </div>
        <div className="arena_fighters">
          <img className="fighters" src={fighter2.fullBodyImage} alt="" />
        </div>
        <div className="arena_hps">
          <div className="health-bar">
            <div
              className={getColorTwo()}
              style={{ width: `${(fighter2.hp / fighter2maxHp) * 100}%` }}
            >
              
            </div>
          </div>
          <p>HP: {fighter2.hp.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
}
