from app.agents.weather_agent import WeatherAgent


agent = WeatherAgent()


result = agent.analyze_weather("R0001")


print("\n========== WEATHER AGENT RESULT ==========\n")

print(result)